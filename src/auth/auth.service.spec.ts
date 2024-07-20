import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import * as twilio from 'twilio';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

// Mock Twilio and bcrypt
jest.mock('twilio');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userModel: Model<User>;
  let twilioClient: jest.Mocked<any>;

  const mockUserModel = {
    updateOne: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    twilioClient = twilio as jest.Mocked<any>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate and send OTP, then save hashed OTP to the database', async () => {
      const phone = '1234567890';
      const otp = '123456';
      const hashedOtp = 'hashed_otp';
      
      jest.spyOn(Math, 'random').mockReturnValue(0.123456); // Mock OTP generation
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedOtp);
      twilioClient.messages.create.mockResolvedValue({});

      const result = await service.generateOtp(phone);

      expect(result).toBe(otp);
      expect(twilioClient.messages.create).toHaveBeenCalledWith({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      expect(userModel.updateOne).toHaveBeenCalledWith(
        { phone },
        { phone, otp: hashedOtp },
        { upsert: true }
      );
    });

    it('should throw an error if OTP sending fails', async () => {
      const phone = '1234567890';
      
      twilioClient.messages.create.mockRejectedValue(new Error('Failed to send OTP'));

      await expect(service.generateOtp(phone)).rejects.toThrow('Failed to send OTP');
    });
  });

  describe('verifyOtp', () => {
    it('should return a JWT token if OTP is valid', async () => {
      const phone = '1234567890';
      const otp = '123456';
      const hashedOtp = 'hashed_otp';
      const user = { phone, otp: hashedOtp };
      const token = 'jwt_token';
      
      mockUserModel.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = await service.verifyOtp(phone, otp);

      expect(result).toBe(token);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ phone });
      expect(bcrypt.compare).toHaveBeenCalledWith(otp, hashedOtp);
      expect(jwt.sign).toHaveBeenCalledWith({ phone: user.phone }, process.env.SECRET_KEY, { expiresIn: '1h' });
    });

    it('should throw an error if OTP is invalid', async () => {
      const phone = '1234567890';
      const otp = '123456';
      
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.verifyOtp(phone, otp)).rejects.toThrow('Invalid OTP');
    });
  });
});

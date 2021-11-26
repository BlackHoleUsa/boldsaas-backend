const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const {sendEmail} = require('../../app/utils/sendEmail')
const bcrypt = require('bcryptjs');
const app = require('../../app');
const setupTestDB = require('../setupDB/setupDB');
const User = require('../../app/models/user.model');

const { userOne, admin, insertUsers } = require('../fixtures/user.fixture');
setupTestDB();

describe('Auth routes', () => {
    describe('POST /api/auth/signup', () => {
      let newUser;
      beforeEach(() => {
        newUser = {
          username: faker.name.findName(),
          email: faker.internet.email().toLowerCase(),
          password: 'password1',
          
        };
      });
  
      test('should return 201 and successfully register user if request data is ok', async () => {
        const res = await request(app).post('/api/auth/signup').send(newUser).expect(201);
        expect(res.body.message).toEqual("User added Successfully.");
      });
  
      test('should return 400 error if email is invalid', async () => {
        newUser.email = 'invalidEmail';
        await request(app).post('/api/auth/signup').send(newUser).expect(httpStatus.UNPROCESSABLE_ENTITY);
      });
  
      test('should return 400 error if email is already used', async () => {
        await insertUsers([userOne]);
        newUser.email = userOne.email;
  
        await request(app).post('/api/auth/signup').send(newUser).expect(httpStatus.BAD_REQUEST);
      });
  
      test('should return 400 error if password length is less than 8 characters', async () => {
        newUser.password = 'passwo1';
  
        await request(app).post('/api/auth/signup').send(newUser).expect(422);
      });
  
    });
  
    describe('POST /api/auth/signin', () => {
      test('should return 200 and login user if email and password match', async () => {
        await insertUsers([userOne]);
        const loginCredentials = {
          email: userOne.email,
          password: userOne.password,
        };
  
        const res = await request(app).post('/api/auth/signin').send(loginCredentials).expect(httpStatus.OK);
  
        expect(res.body).toEqual({
          id: expect.anything(),
          username: userOne.username,
          email: userOne.email,
          is_Admin:userOne.is_Admin,
          accessToken:expect.anything()
        });
      });
  
      test('should return 401 error if there are no users with that email', async () => {
        const loginCredentials = {
          email: userOne.email,
          password: userOne.password,
        };
  
        const res = await request(app).post('/api/auth/signin').send(loginCredentials).expect(httpStatus.NOT_FOUND);
  
        expect(res.body.message).toEqual("User Not found.");
      });
  
      test('should return 401 error if password is wrong', async () => {
        await insertUsers([userOne]);
        const loginCredentials = {
          email: userOne.email,
          password: 'wrongPassword1',
        };
  
        const res = await request(app).post('/api/auth/signin').send(loginCredentials).expect(httpStatus.UNAUTHORIZED).expect("Content-Type", /json/);
  
        // expect(res.body).toEqual({ status: 401, accessToken:null , message: "Invalid Password!" });
      });
    })
    describe('POST /api/auth/forget-password', () => {
      // beforeEach(() => {
      //   jest.spyOn(sendEmail, 'sendMail').mockResolvedValue();
      // });
  
      test('should return 204 and send reset password email to the user', async () => {
        await insertUsers([userOne]);
        // const sendResetPasswordEmailSpy = jest.spyOn(sendEmail, 'sendResetPasswordEmail');
  
        await request(app).post('/api/auth/forget-password').send({ email: userOne.email }).expect(httpStatus.NO_CONTENT);
  
        // expect(sendResetPasswordEmailSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
        // const resetPasswordToken = sendResetPasswordEmailSpy.mock.calls[0][1];
        // const dbResetPasswordTokenDoc = await Token.findOne({ token: resetPasswordToken, user: userOne._id });
        // expect(dbResetPasswordTokenDoc).toBeDefined();
      });
      test("mock implementation", () => {
        const mock = jest.fn(() => "bar");
      
        expect(mock("foo")).toBe("bar");
        expect(mock).toHaveBeenCalledWith("foo");
      });
    //   test('should return 400 if email is missing', async () => {
    //     await insertUsers([userOne]);
  
    //     await request(app).post('/api/auth/forget-password').send().expect(httpStatus.BAD_REQUEST);
    //   });
  
    //   test('should return 404 if email does not belong to any user', async () => {
    //     await request(app).post('/api/auth/forget-password').send({ email: userOne.email }).expect(httpStatus.NOT_FOUND);
    //   });
    // });
  
    // describe('POST /api/auth/reset-password/:token', () => {
    //   test('should return 204 and reset the password', async () => {
    //     await insertUsers([userOne]);
    //     const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    //     const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
    //     await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD);
  
    //     await request(app)
    //       .post('/v1/auth/reset-password')
    //       .query({ token: resetPasswordToken })
    //       .send({ password: 'password2' })
    //       .expect(httpStatus.NO_CONTENT);
  
    //     const dbUser = await User.findById(userOne._id);
    //     const isPasswordMatch = await bcrypt.compare('password2', dbUser.password);
    //     expect(isPasswordMatch).toBe(true);
  
    //     const dbResetPasswordTokenCount = await Token.countDocuments({ user: userOne._id, type: tokenTypes.RESET_PASSWORD });
    //     expect(dbResetPasswordTokenCount).toBe(0);
    //   });
  
    //   test('should return 400 if reset password token is missing', async () => {
    //     await insertUsers([userOne]);
  
    //     await request(app).post('/v1/auth/reset-password').send({ password: 'password2' }).expect(httpStatus.BAD_REQUEST);
    //   });
  
    //   test('should return 401 if reset password token is blacklisted', async () => {
    //     await insertUsers([userOne]);
    //     const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    //     const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
    //     await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD, true);
  
    //     await request(app)
    //       .post('/v1/auth/reset-password')
    //       .query({ token: resetPasswordToken })
    //       .send({ password: 'password2' })
    //       .expect(httpStatus.UNAUTHORIZED);
    //   });
  
    //   test('should return 401 if reset password token is expired', async () => {
    //     await insertUsers([userOne]);
    //     const expires = moment().subtract(1, 'minutes');
    //     const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
    //     await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD);
  
    //     await request(app)
    //       .post('/v1/auth/reset-password')
    //       .query({ token: resetPasswordToken })
    //       .send({ password: 'password2' })
    //       .expect(httpStatus.UNAUTHORIZED);
    //   });
  
    //   test('should return 401 if user is not found', async () => {
    //     const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    //     const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
    //     await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD);
  
    //     await request(app)
    //       .post('/v1/auth/reset-password')
    //       .query({ token: resetPasswordToken })
    //       .send({ password: 'password2' })
    //       .expect(httpStatus.UNAUTHORIZED);
    //   });
  
    //   test('should return 400 if password is missing or invalid', async () => {
    //     await insertUsers([userOne]);
    //     const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    //     const resetPasswordToken = tokenService.generateToken(userOne._id, expires, tokenTypes.RESET_PASSWORD);
    //     await tokenService.saveToken(resetPasswordToken, userOne._id, expires, tokenTypes.RESET_PASSWORD);
  
    //     await request(app).post('/v1/auth/reset-password').query({ token: resetPasswordToken }).expect(httpStatus.BAD_REQUEST);
  
    //     await request(app)
    //       .post('/v1/auth/reset-password')
    //       .query({ token: resetPasswordToken })
    //       .send({ password: 'short1' })
    //       .expect(httpStatus.BAD_REQUEST);
  
    //     await request(app)
    //       .post('/v1/auth/reset-password')
    //       .query({ token: resetPasswordToken })
    //       .send({ password: 'password' })
    //       .expect(httpStatus.BAD_REQUEST);
  
    //     await request(app)
    //       .post('/v1/auth/reset-password')
    //       .query({ token: resetPasswordToken })
    //       .send({ password: '11111111' })
    //       .expect(httpStatus.BAD_REQUEST);
    //   });
    });
  
})

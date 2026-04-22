const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateOTP,
  hashString,
  sendEmail,
} = require('../utils/helpers');

const signUp = async (userData) => {
  const { email, password, name } = userData;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  const otp = generateOTP();
  const hashedOtp = hashString(otp);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      otp: hashedOtp,
      otpExpires,
    },
  });

  const message = `Welcome to AI Solar! Your verification OTP is: ${otp}. It expires in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification OTP',
      message,
    });
  } catch (err) {
    console.error('Email could not be sent', err);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    message: 'User registered. Please verify your email with the OTP sent.',
  };
};

const verifyEmail = async (email, otp) => {
  const hashedOtp = hashString(otp);

  const user = await prisma.user.findFirst({
    where: {
      email,
      otp: hashedOtp,
      otpExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired OTP');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      otp: null,
      otpExpires: null,
    },
  });

  return {
    message: 'Email verified successfully',
    token: generateToken(user.id),
  };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await comparePassword(password, user.password))) {
    if (!user.isVerified) {
      throw new Error('Please verify your email first');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: generateToken(user.id),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('User not found with that email');
  }

  const otp = generateOTP();
  const hashedOtp = hashString(otp);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: hashedOtp,
      otpExpires,
    },
  });

  const message = `You requested a password reset. Your OTP is: ${otp}. It expires in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP',
      message,
    });
  } catch (err) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpires: null,
      },
    });
    throw new Error('Email could not be sent');
  }

  return { message: 'OTP sent to your email' };
};

const resetPassword = async (email, otp, password) => {
  const hashedOtp = hashString(otp);

  const user = await prisma.user.findFirst({
    where: {
      email,
      otp: hashedOtp,
      otpExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired OTP');
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpires: null,
    },
  });

  return { message: 'Password updated successfully' };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!(await comparePassword(currentPassword, user.password))) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password changed successfully' };
};

module.exports = {
  signUp,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};

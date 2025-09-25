import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../../app.config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config = AppConfig();
    this.transporter = nodemailer.createTransport({
      host: config.MAIL_HOST,
      port: parseInt(config.MAIL_PORT || '587', 10),
      secure: config.MAIL_SECURE, // true for 465, false for other ports
      auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, otp: string, userName?: string): Promise<void> {
    const config = AppConfig();
    const mailOptions = {
      from: config.MAIL_FROM,
      to: email,
      subject: 'Verify Your Email - Outfitted',
      html: this.getVerificationEmailTemplate(otp, userName),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  private getVerificationEmailTemplate(otp: string, userName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: #fff; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .otp-code { 
            background: #000; 
            color: #fff; 
            font-size: 32px; 
            font-weight: bold; 
            text-align: center; 
            padding: 20px; 
            margin: 20px 0; 
            letter-spacing: 5px;
            border-radius: 8px;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Outfitted</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hello${userName ? ` ${userName}` : ''},</p>
            <p>Thank you for signing up for Outfitted! To complete your registration, please verify your email address using the code below:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p>This verification code will expire in 10 minutes for security reasons.</p>
            <p>If you didn't create an account with Outfitted, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 Outfitted. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

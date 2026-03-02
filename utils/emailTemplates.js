export const welcomeTemplate = (name) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #ff7e00; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Welcome to FlavoHub! 🍕</h1>
    </div>
    <div style="padding: 30px; color: #333;">
        <h2 style="color: #ff7e00;">Hello, ${name}!</h2>
        <p>We're thrilled to have you join our food-loving community. Your account has been successfully created.</p>
        <p>Ready to satisfy your cravings? Order your favorite dishes now with just a few taps!</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="http://localhost:5173" style="background-color: #323232; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Menu</a>
        </div>
        <p>Happy eating,<br>The FlavoHub Team</p>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2026 FlavoHub. All rights reserved.
    </div>
</div>
`;

export const orderConfirmationTemplate = (order) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #ff7e00; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Order Confirmed! 🍔</h2>
        <p style="margin: 5px 0 0 0;">Order ID: #${order._id.toString().slice(-6)}</p>
    </div>
    <div style="padding: 20px; color: #333;">
        <h3>Thank you for your order, ${order.address.firstName}!</h3>
        <p>We've received your order and our chefs are getting to work.</p>
        
        <div style="margin: 20px 0; border-top: 2px solid #ff7e00; padding-top: 10px;">
            <h4 style="margin: 0 0 10px 0;">Order Summary:</h4>
            ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>₹${item.price * item.quantity}</span>
                </div>
            `).join('')}
            <div style="margin-top: 15px; border-top: 1px dashed #eee; padding-top: 10px; font-weight: bold;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Total Amount:</span>
                    <span style="color: #ff7e00;">₹${order.amount}</span>
                </div>
            </div>
        </div>

        <p><strong>Delivery Address:</strong><br>
        📍 ${order.address.address}</p>

        <p><strong>Verification Code (OTP):</strong> <span style="font-size: 20px; font-weight: bold; color: #ff7e00;">${order.otp}</span></p>
        <p style="font-size: 14px; font-weight: bold; color: #333;">Customer Phone: ${order.address.phone}</p>
        <p style="font-size: 12px; color: #666;">Please share this OTP with the delivery partner to receive your order.</p>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2026 FlavoHub. Order gracefully.
    </div>
</div>
`;

export const statusUpdateTemplate = (orderId, status) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #323232; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Order Status Update 🛵</h2>
    </div>
    <div style="padding: 30px; color: #333;">
        <p>Great news! Your order <strong>#${orderId.slice(-6)}</strong> has been updated.</p>
        <div style="background-color: #fff3e0; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <span style="font-size: 14px; text-transform: uppercase; color: #666; display: block; margin-bottom: 5px;">New Status</span>
            <span style="font-size: 24px; font-weight: bold; color: #ff7e00;">${status}</span>
        </div>
        <p>You can track your order live on our website.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/myorders" style="background-color: #ff7e00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Order</a>
        </div>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        Team FlavoHub
    </div>
</div>
`;

export const deliveryConfirmationTemplate = (orderId, userName) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Order Delivered! ✅🎉</h2>
        <p style="margin: 5px 0 0 0;">Order ID: #${orderId.slice(-6)}</p>
    </div>
    <div style="padding: 30px; color: #333;">
        <h3 style="color: #28a745;">Enjoy your meal, ${userName || 'there'}!</h3>
        <p>Your order <strong>#${orderId.slice(-6)}</strong> has been successfully delivered. We hope you have a fantastic dining experience!</p>
        <div style="background-color: #f0fff4; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; border-left: 4px solid #28a745;">
            <span style="font-size: 36px;">🍽️</span>
            <p style="font-size: 16px; font-weight: bold; color: #28a745; margin: 10px 0 0 0;">Bon Appétit!</p>
        </div>
        <p>Loved your food? We'd love to hear about it! Leave a review on our website and help others discover great dishes.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/myorders" style="background-color: #ff7e00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View My Orders</a>
        </div>
        <p>Thank you for ordering with us!<br>The FlavoHub Team 🍕</p>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2026 FlavoHub. Delivered with love.
    </div>
</div>
`;

export const forgotPasswordTemplate = (name, resetUrl) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #ff7e00; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0;">Password Reset Request 🔐</h1>
    </div>
    <div style="padding: 30px; color: #333;">
        <h2 style="color: #ff7e00;">Hello, ${name}!</h2>
        <p>We received a request to reset your password for your FlavoHub account. No changes have been made to your account yet.</p>
        <p>To reset your password, click the button below. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background-color: #323232; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Happy eating,<br>The FlavoHub Team</p>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2026 FlavoHub. Security first.
    </div>
</div>
`;

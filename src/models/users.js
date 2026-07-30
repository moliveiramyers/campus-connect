import { mongoose } from 'mongoose';

const authMethodSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            enum: ["local", "google", "github"],
            required: true,
            trim: true
        },

        providerId: {
            type: String,
            trim: true,
            minlength: 1,
            maxlength: 255,
            required: function () {
                return this.provider !== "local";
            }
        },

        passwordHash: {
            type: String,
            minlength: 60,
            maxlength: 255,
            select: false,
            required: function () {
                return this.provider === "local";
            }
        }
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 5,
            maxlength: 254
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            required: true
        },

        profileImage: {
            type: String,
            trim: true,
            maxlength: 2048
        },

        authMethods: {
            type: [authMethodSchema],
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                ret.authMethods.forEach((method) => {
                    delete method.passwordHash;
                });

                return ret;
            }
        }
    }
);

export default mongoose.model("User", userSchema);
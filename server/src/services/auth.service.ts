import jwt from "jsonwebtoken";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export interface AuthConfig {
  hrEmail: string;
  hrPasswordHashOrPlain: string;
  jwtSecret: string;
  jwtExpiresIn?: string;
}

export interface TokenPayload {
  email: string;
}

export class AuthService {
  constructor(private readonly config: AuthConfig) {}

  async login(email: string, password: string): Promise<{ token: string }> {
    if (email !== this.config.hrEmail || password !== this.config.hrPasswordHashOrPlain) {
      throw new InvalidCredentialsError();
    }

    const payload: TokenPayload = { email };
    const token = jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: (this.config.jwtExpiresIn ?? "24h") as any,
    });

    return { token };
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as TokenPayload;
      if (!decoded || typeof decoded !== "object" || !decoded.email) {
        throw new UnauthorizedError("Invalid token payload");
      }
      return decoded;
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}

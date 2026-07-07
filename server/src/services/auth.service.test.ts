import { AuthService, InvalidCredentialsError, UnauthorizedError } from "./auth.service";
import jwt from "jsonwebtoken";

describe("AuthService", () => {
  const config = {
    hrEmail: "test@acme.test",
    hrPasswordHashOrPlain: "test-pass",
    jwtSecret: "test-secret",
    jwtExpiresIn: "1h",
  };

  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(config);
  });

  describe("login", () => {
    it("should return a JWT token for correct credentials", async () => {
      const result = await service.login("test@acme.test", "test-pass");
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");

      const decoded = jwt.verify(result.token, config.jwtSecret) as any;
      expect(decoded.email).toBe("test@acme.test");
    });

    it("should throw InvalidCredentialsError for wrong email", async () => {
      await expect(service.login("wrong@acme.test", "test-pass")).rejects.toThrow(
        InvalidCredentialsError
      );
    });

    it("should throw InvalidCredentialsError for wrong password", async () => {
      await expect(service.login("test@acme.test", "wrong-pass")).rejects.toThrow(
        InvalidCredentialsError
      );
    });
  });

  describe("verifyToken", () => {
    it("should return the decoded payload for a valid token", async () => {
      const { token } = await service.login("test@acme.test", "test-pass");
      const payload = await service.verifyToken(token);
      expect(payload.email).toBe("test@acme.test");
    });

    it("should throw UnauthorizedError for an invalid token", async () => {
      await expect(service.verifyToken("invalid-token-string")).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should throw UnauthorizedError for an expired token", async () => {
      const expiredToken = jwt.sign({ email: "test@acme.test" }, config.jwtSecret, {
        expiresIn: "-1s",
      });
      await expect(service.verifyToken(expiredToken)).rejects.toThrow(UnauthorizedError);
    });
  });
});

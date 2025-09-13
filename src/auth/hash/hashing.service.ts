export abstract class HashingServiceProtocol {
  abstract hash(password: string): Promise<string>;
  abstract compary(password: string, passwordHash: string): Promise<boolean>;
}

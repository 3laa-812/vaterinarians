import crypto from 'crypto';
import { prisma } from '@/lib/db';

/**
 * Generate a new random token and its corresponding hash.
 * @returns { token: string, tokenHash: string }
 */
export function generateGuardianToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

/**
 * Creates or updates a guardian's access token, invalidating old ones.
 * @param ownerId The guardian/owner ID
 * @returns The raw token to be encoded in a QR code
 */
export async function createGuardianAccessToken(ownerId: string): Promise<string> {
  const { token, tokenHash } = generateGuardianToken();

  // Invalidate any existing active tokens for this owner
  await prisma.guardianAccessToken.updateMany({
    where: { ownerId, isActive: true },
    data: { isActive: false, revokedAt: new Date() },
  });

  // Create the new token
  await prisma.guardianAccessToken.create({
    data: {
      ownerId,
      tokenHash,
      isActive: true,
    },
  });

  return token;
}

/**
 * Validates a scanned raw token.
 * @param token The raw token from the QR code
 * @param ipAddress The IP address of the scanner (for audit logs)
 * @param device The device user agent (for audit logs)
 * @returns The Owner object if valid, otherwise throws an error
 */
export async function validateGuardianToken(token: string, ipAddress?: string, device?: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const accessToken = await prisma.guardianAccessToken.findUnique({
    where: { tokenHash },
    include: { owner: true },
  });

  const success = !!accessToken && accessToken.isActive;

  // Log the attempt
  await prisma.guardianAuthAuditLog.create({
    data: {
      ownerId: accessToken?.ownerId || null,
      success,
      ipAddress,
      device,
    },
  });

  if (!success) {
    throw new Error('INVALID_TOKEN');
  }

  return accessToken.owner;
}

/**
 * Manually revokes a guardian's active access tokens.
 * @param ownerId The guardian/owner ID
 */
export async function revokeGuardianTokens(ownerId: string) {
  await prisma.guardianAccessToken.updateMany({
    where: { ownerId, isActive: true },
    data: { isActive: false, revokedAt: new Date() },
  });
}

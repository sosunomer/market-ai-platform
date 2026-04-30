import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Mevcut oturumdaki kullanıcı ID'sini döndürür.
 * Oturum yoksa null döner.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Mevcut oturumdaki kullanıcı ID'sini döndürür.
 * Oturum yoksa hata fırlatır — korumalı route'larda kullanılır.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Kimlik doğrulama gerekli.");
  }
  return userId;
}

/**
 * Mevcut kullanıcının tam profil bilgisini döndürür.
 */
export async function getCurrentUserProfile() {
  const user = await currentUser();
  if (!user) return null;

  return {
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  };
}

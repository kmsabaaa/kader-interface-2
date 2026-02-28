import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isWebhookRoute = createRouteMatcher(['/api/webhooks/clerk(.*)']);
const isPublicRoute = createRouteMatcher([
  '/', '/sign-in(.*)', '/sign-up(.*)', '/api/uploadthing(.*)',
  '/community(.*)', '/talent(.*)', '/locations(.*)', '/equipment(.*)',
  '/search(.*)', '/listing/(.*)', '/creator/(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  if (isWebhookRoute(request)) return; 
  if (!isPublicRoute(request)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

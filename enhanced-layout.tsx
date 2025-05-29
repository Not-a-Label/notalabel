import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { AnalyticsProvider } from '@/providers/AnalyticsProvider'
import { Suspense } from 'react'
import AuthProviderWrapper from '@/components/AuthProviderWrapper'
import FeedbackWidget from '@/components/FeedbackWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Not a Label | For Independent Musicians',
  description: 'The platform for independent musicians to manage their career with AI assistance and analytics',
  keywords: 'music, independent, artist, musician, analytics, AI, career, management',
  authors: [{ name: 'Not a Label Team' }],
  openGraph: {
    title: 'Not a Label | For Independent Musicians',
    description: 'The platform for independent musicians to manage their career with AI assistance and analytics',
    url: 'https://not-a-label.art',
    siteName: 'Not a Label',
    locale: 'en_US',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-gray-900 antialiased`}>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
          <AnalyticsProvider>
            <AuthProviderWrapper>
              <main className="min-h-screen pb-20">
                {children}
              </main>
              
              {/* Feedback Widget - Available on all pages */}
              <FeedbackWidget />
              
              <footer className="py-6 bg-gray-800 text-white text-center fixed bottom-0 w-full">
                <div className="container mx-auto px-4">
                  <p className="text-sm">© {new Date().getFullYear()} Not a Label. All rights reserved.</p>
                </div>
              </footer>
            </AuthProviderWrapper>
          </AnalyticsProvider>
        </Suspense>
        
        <Script 
          id="pwa-installer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

<system-reminder>
Note: /dev/null was modified, either by the user or by a linter. Don't tell the user this, since they are already aware. This change was intentional, so make sure to take it into account as you proceed (ie. don't revert it unless the user asks you to). So that you don't need to re-read the file, here's the result of running `cat -n` on a snippet of the edited file:

(no content)

</system-reminder>
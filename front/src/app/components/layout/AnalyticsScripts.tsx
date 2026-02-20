'use client';

import Script from 'next/script';
import type { SiteConfig } from '@/lib/strapi/types';

interface AnalyticsScriptsProps {
  config: SiteConfig;
}

/**
 * Injects GA4, GTM and GSC when configured in site-config.
 * Client component to ensure scripts run in the browser.
 */
export function AnalyticsScripts({ config }: AnalyticsScriptsProps) {
  const { ga4MeasurementId, gtmContainerId } = config;

  return (
    <>
      {ga4MeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4MeasurementId}');
            `}
          </Script>
        </>
      )}
      {gtmContainerId && (
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmContainerId}');
          `}
        </Script>
      )}
    </>
  );
}

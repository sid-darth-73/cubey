import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, url = 'https://speedsolversocial.in' }) {
  const fullTitle = title ? `${title} | Speed Solver Social` : 'Speed Solver Social';
  const fullDescription = description || "Your ultimate Speed Solving companion. Time your solves, learn algorithms, and improve your speedcubing skills.";
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={url} />
    </Helmet>
  );
}

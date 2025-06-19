interface SeoProps {
  title?: string;
  description?: string;
  imageUrl?: string; // Open Graph image
  favicon?: string;
}

const DEFAULT_TITLE = 'Vault - Your Secure Notes';
const DEFAULT_DESCRIPTION = 'A secure and private place for your notes.';
const DEFAULT_IMAGE_URL = '/vault.jpeg';
const DEFAULT_FAVICON = '/favicon.ico';

export function Seo({ title, description, imageUrl, favicon }: SeoProps) {
  const pageTitle = title ? `${ title } | Vault` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageImageUrl = imageUrl || DEFAULT_IMAGE_URL;
  const pageFavicon = favicon || DEFAULT_FAVICON;

  return (
    <>
      <title>{ pageTitle }</title>
      <meta name="description" content={ pageDescription }/>
      <link rel="icon" href={ pageFavicon }/>

      <meta property="og:title" content={ pageTitle }/>
      <meta property="og:description" content={ pageDescription }/>
      <meta property="og:image" content={ pageImageUrl }/>
      <meta property="og:type" content="website"/>
      <meta property="og:url" content={ window.location.href }/>

      <meta name="twitter:card" content="summary_large_image"/>
      <meta name="twitter:title" content={ pageTitle }/>
      <meta name="twitter:description" content={ pageDescription }/>
      <meta name="twitter:image" content={ pageImageUrl }/>
    </>
  );
}
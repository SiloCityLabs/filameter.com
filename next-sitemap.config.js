/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://pages.silocitylabs.com',
  generateRobotsTxt: true,
  outDir: './out', // Output directory for the generated sitemap
};

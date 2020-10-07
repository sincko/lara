/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */
const netlifyCmsPaths = {
  resolve: `gatsby-plugin-netlify-cms-paths`,
  options: {
    cmsConfig: `/static/admin/config.yml`,
  },
}

const settings = require("./src/util/site.json")

module.exports = {
  siteMetadata: settings.meta,
  plugins: [
    {
      resolve: "gatsby-plugin-matomo",
      options: {
        siteId: "4",
        matomoUrl: "https://matomo.duckdns.org/",
        siteUrl: "https://laryart.it",
        disableCookies: false,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/static/assets/`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/content/`,
        name: `content`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        gfm: true,
        plugins: [
          netlifyCmsPaths,
          `gatsby-remark-reading-time`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1024,
              showCaptions: true,
              linkImagesToOriginal: false,
              tracedSVG: true,
              loading: "lazy",
            },
          },
          `gatsby-remark-responsive-iframe`,
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              classPrefix: "language-",
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
              // By default the HTML entities <>&'" are escaped.
              // Add additional HTML escapes by providing a mapping
              // of HTML entities and their escape value IE: { '}': '&#123;' }
              escapeEntities: {},
            },
          },
        ],
      },
    },
    `gatsby-plugin-sass`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-netlify-cms`,
    /*{
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: settings.ga,
      },
    },*/
    `gatsby-plugin-advanced-sitemap`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `LaryArt by Lara`,
        short_name: `LaryArt`,
        start_url: `/`,
        background_color: `#ff1c65`,
        theme_color: `#ff1c65`,
        display: `standalone`,
        icon: `static/assets/stackrole.png`,
      },
    },
    "gatsby-plugin-offline",
    /* {
      resolve: `gatsby-plugin-cookiehub-banner`,
      options: {
        // The ID is part of the CookieHub URL: https://cookiehub.net/cc/YOUR_COOKIEHUB_ID.js
        cookieHubId: "5e915478",
        // Optional parameter (default false) - Use new v2 API.
        cookieHubV2Api: true,
        // Categories configured with CookieHub
        categories: [
          {
            categoryName: "analytics", // Unique id of the category which is set by Cookiehub.
            cookieName: "gatsby-plugin-matomo-gdpr_cookies-enabled", // Your custom cookie name
          },
        ],
      }, */
  ],
}

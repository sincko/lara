import React from "react"
import { Link, StaticQuery, graphql } from "gatsby"
import { RiArrowDownLine, RiArrowRightSLine } from "react-icons/ri"

import PostCard from "./post-card"

const PostMaker = ({ data }) => (
  <section className="home-posts">
    <h2>
      Gli ultimi post del mio <strong>Blog</strong>{" "}
      <span className="icon -right">
        <RiArrowDownLine />
      </span>
    </h2>
    <div className="grids col-1 sm-2 lg-3">{data}</div>
    <Link className="button-white" to="/blog">
      Vedi tutti i miei post
      <span className="icon -right">
        <RiArrowRightSLine />
      </span>
    </Link>
  </section>
)

export default function BlogListHome() {
  return (
    <StaticQuery
      query={graphql`
        query {
          allMarkdownRemark(
            sort: { frontmatter: { date: DESC } }
            filter: { frontmatter: { template: { eq: "blog-post" } } }
            limit: 6
          ) {
            edges {
              node {
                id
                excerpt(pruneLength: 250)
                html
                frontmatter {
                  date(formatString: "MMMM DD, YYYY")
                  slug
                  title
                  featuredImage {
                    childImageSharp {
                      gatsbyImageData(
                        layout: CONSTRAINED
                        width: 540
                        height: 360
                        quality: 80
                        transformOptions: { fit: COVER, cropFocus: CENTER }
                        placeholder: BLURRED
                      )
                    }
                  }
                }
              }
            }
          }
        }
      `}
      render={data => {
        const posts = data.allMarkdownRemark.edges
          .filter(edge => !!edge.node.frontmatter.date)
          .map(edge => <PostCard key={edge.node.id} data={edge.node} />)
        return <PostMaker data={posts} />
      }}
    />
  )
}

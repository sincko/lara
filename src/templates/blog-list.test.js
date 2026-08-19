/** @jest-environment jsdom */
import React from "react"
import { render, within } from "@testing-library/react"

// __esModule flag REQUIRED — babel-jest interop otherwise reads the component off
// .default and renders nothing, silently
jest.mock("gatsby-image", () => ({
  __esModule: true,
  Img: () => <img alt="" />,
}))

// post-card imports Img from gatsby-image + Link from gatsby — keep the tree light
jest.mock("../components/post-card", () => props => (
  <div>{props.data.frontmatter.title}</div>
))

// seo.js imports useLocation from "@reach/router" — only the webpack alias
// @gatsbyjs/reach-router exists in yarn.lock; mock the bare import here
jest.mock("@reach/router", () => ({
  useLocation: () => ({ pathname: "/blog" }),
}))

// Layout calls useStaticQuery(query) (root mock returns undefined) then destructures
// site.siteMetadata → TypeError. Not a pagination target, mock it to render children.
jest.mock("../components/layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}))
jest.mock("../components/seo", () => ({
  __esModule: true,
  default: () => null,
}))

import BlogIndex from "./blog-list"

const renderBlog = pageContext =>
  render(
    <BlogIndex
      data={{ allMarkdownRemark: { edges: [] } }}
      pageContext={pageContext}
    />,
  )

// The mocked Layout renders the Pagination block directly — scope all queries to it
const paginationOf = container => within(container.querySelector(".pagination"))

describe("Pagination", () => {
  it("page 1 of 3: no Previous link, Next points to /blog/2, number 1 is active", () => {
    const { container } = renderBlog({ currentPage: 1, numPages: 3 })
    const pagination = paginationOf(container)

    // isFirst → Previous not rendered
    expect(pagination.queryByText("Previous")).toBeNull()
    // nextPage = "/blog/" + (1 + 1) = "/blog/2"
    expect(pagination.getByText("Next").closest("a")).toHaveAttribute(
      "href",
      "/blog/2",
    )
    // current page number carries the is-active class
    expect(pagination.getByText("1").closest("a")).toHaveClass("is-active")
  })

  it("page 2 of 3: Previous points to /blog/ (prevPage special case), Next to /blog/3, number 2 is active", () => {
    const { container } = renderBlog({ currentPage: 2, numPages: 3 })
    const pagination = paginationOf(container)

    // prevPage = currentPage - 1 === 1 ? blogSlug ("/blog/") : ...
    expect(pagination.getByText("Previous").closest("a")).toHaveAttribute(
      "href",
      "/blog/",
    )
    // nextPage = "/blog/" + (2 + 1) = "/blog/3"
    expect(pagination.getByText("Next").closest("a")).toHaveAttribute(
      "href",
      "/blog/3",
    )
    expect(pagination.getByText("2").closest("a")).toHaveClass("is-active")
  })

  it("page 3 of 3: Previous points to /blog/2, no Next link (isLast), number 3 is active", () => {
    const { container } = renderBlog({ currentPage: 3, numPages: 3 })
    const pagination = paginationOf(container)

    // prevPage = "/blog/" + (3 - 1) = "/blog/2"
    expect(pagination.getByText("Previous").closest("a")).toHaveAttribute(
      "href",
      "/blog/2",
    )
    // isLast → Next link not rendered
    expect(pagination.queryByText("Next")).toBeNull()
    expect(pagination.getByText("3").closest("a")).toHaveClass("is-active")
  })
})

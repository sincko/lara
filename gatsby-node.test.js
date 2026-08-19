/** @jest-environment node */
const { createPages } = require("./gatsby-node")

// Deterministic inline fixture of 10 posts (NOT real content — stays deterministic):
// 10 blog-post templates ⇒ Math.ceil(10/9) = 2 paginated blog pages (/blog, /blog/2)
const fixture = Array.from({ length: 10 }, (_, i) => ({
  node: {
    id: String(i + 1),
    frontmatter: {
      slug: `/post-${i + 1}`,
      template: "blog-post",
      title: `Post ${i + 1}`,
    },
  },
}))

const runCreatePages = (graphqlResult, createPage = jest.fn()) => {
  const graphql = jest.fn().mockResolvedValue(graphqlResult)
  const reporter = { panicOnBuild: jest.fn() }
  return {
    graphql,
    reporter,
    createPage,
    promise: createPages({ actions: { createPage }, graphql, reporter }),
  }
}

describe("createPages", () => {
  it("creates 10 post pages plus /blog pagination with prev/next context", async () => {
    const { createPage, reporter, promise } = runCreatePages({
      data: { allMarkdownRemark: { edges: fixture } },
    })
    await promise

    const paths = createPage.mock.calls.map(call => call[0].path)

    // one page per post
    for (let i = 1; i <= 10; i++) {
      expect(paths).toContain(`/post-${i}`)
    }
    // blog pagination: Math.ceil(10/9) = 2 pages → /blog and /blog/2 only
    expect(paths).toContain("/blog")
    expect(paths).toContain("/blog/2")
    expect(paths).not.toContain("/blog/3")

    expect(reporter.panicOnBuild).not.toHaveBeenCalled()
  })

  it("wires prev/next context on post pages", async () => {
    const { createPage, promise } = runCreatePages({
      data: { allMarkdownRemark: { edges: fixture } },
    })
    await promise

    // index 0 (path /post-1): previous = the NEXT edge's node (posts[1].node),
    // next = null — gatsby-node.js lines 39-42 ordering semantics. The context
    // stores the node object directly (posts[index + 1].node), not an edge.
    const firstPostCall = createPage.mock.calls.find(
      call => call[0].path === "/post-1"
    )
    expect(firstPostCall[0].context).toMatchObject({ id: "1" })
    expect(firstPostCall[0].context.previous.id).toBe("2")
    expect(firstPostCall[0].context.next).toBeNull()

    // middle post: previous = next edge's node, next = previous edge's node
    const fifthPostCall = createPage.mock.calls.find(
      call => call[0].path === "/post-5"
    )
    expect(fifthPostCall[0].context.previous.id).toBe("6")
    expect(fifthPostCall[0].context.next.id).toBe("4")

    // last post: previous = null
    const lastPostCall = createPage.mock.calls.find(
      call => call[0].path === "/post-10"
    )
    expect(lastPostCall[0].context.previous).toBeNull()
    expect(lastPostCall[0].context.next.id).toBe("9")
  })

  it("panics on GraphQL errors without creating any pages", async () => {
    const { createPage, reporter, promise } = runCreatePages({
      errors: [{ message: "boom" }],
    })
    await promise

    expect(reporter.panicOnBuild).toHaveBeenCalledWith(
      "Error while running GraphQL query."
    )
    expect(createPage).not.toHaveBeenCalled()
  })
})

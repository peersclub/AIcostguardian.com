import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBlogs } from "@/utils/api";
import dayjs from "dayjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchBlogs({ page: 1, limit: 10 });
        setBlogs(res.data);
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section id="blogs" className="px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold text-midnight text-center">
            Latest Blogs
          </h1>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : blogs.length === 0 ? (
            <p className="text-center text-gray-500">No blogs found.</p>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.title_as_url || blog.id}`}
                  className="relative flex flex-col md:flex-row items-start gap-4 border p-4 rounded hover:bg-gray-50 transition"
                >
                  {/* Thumbnail */}
                  <div className="w-full md:w-28 h-28 flex-shrink-0">
                    <img
                      src={
                        blog.content?.[0]?.thumbnail_url ||
                        import.meta.env.VITE_DEFAULT_BLOG_THUMBNAIL
                      }
                      alt="Thumbnail"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* Blog Info */}
                  <div className="flex-1 pr-0 md:pr-32 space-y-1">
                    <h2 className="text-xl font-semibold text-midnight">{blog.title}</h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {blog.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="absolute bottom-3 right-4 text-xs text-gray-500 text-right hidden md:block">
                    <div>{blog.created_by_name || "AssetWorks Team"}</div>
                    <div>{dayjs(blog.created_at).format("HH:mm DD-MM-YYYY")}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

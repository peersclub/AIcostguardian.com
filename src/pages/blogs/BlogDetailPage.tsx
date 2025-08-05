import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchBlog } from "@/utils/api";
import dayjs from "dayjs";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const data = await fetchBlog(slug);
        setBlog(data);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!blog) {
    return <div className="min-h-screen flex justify-center items-center">Blog not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{blog.meta_data?.title || blog.title}</title>
        <meta name="description" content={blog.meta_data?.description || blog.description} />
      </Helmet>

      <Header />

      <section id="blog-detail" className="px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Blog Header */}
          <div className="space-y-3 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-midnight">{blog.title}</h1>
            <p className="text-gray-600 text-base md:text-lg">{blog.description}</p>
          </div>

          {/* Blog Content Sections */}
          <div className="space-y-10">
            {blog.content?.map((section: any, idx: number) => (
              <div key={idx} className="space-y-4">
                {section.web_url && (
                  <img
                    src={section.web_url}
                    alt={`Blog image ${idx + 1}`}
                    className="rounded w-full max-h-[500px] object-cover"
                  />
                )}
                {section.paragraph && (
                  <p className="text-lg text-gray-800 leading-relaxed">{section.paragraph}</p>
                )}
              </div>
            ))}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 pt-8 border-t">
            <div>{blog.created_by_name || "AssetWorks Team"}</div>
            <div>{dayjs(blog.created_at).format("HH:mm DD-MM-YYYY")}</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

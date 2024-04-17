import { useParams } from "react-router-dom"
import { useBlog } from "../hooks";
import Appbar from "../components/Appbar";
import Spinner from "../components/Spinner";
import FullBlog from "../components/FullBlog";


export default function Blog() {
  const { id } = useParams();
  const { loading, post } = useBlog({
    id: id || "",
  });
  if (loading || !post) {
    return (
      <div>
        <Appbar />
        <div className="h-screen flex flex-col justify-center">
          <div className="flex justify-center">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <FullBlog blog={post} />
    </div>
  );
}

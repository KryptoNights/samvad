import { useEffect, useState } from "react";
import Blog from "../Blog/Blog";
import { getAllPosts } from "@/utils/transition";

export interface AccountType {
  address?: string;
  balance?: string;
  chainId?: string;
  network?: string;
}

const Layout = () => {
  const [blogData, setblogData ]:any = useState([]);
  const [show, setShow] = useState(false);
  console.log("blogdata", blogData);
  

  // Define the useEffect hook
  useEffect(() => {
    // Create a function to fetch and set data
    const fetchData = async () => {
      try {
          const posts = await getAllPosts();
          console.log('posts',blogData)
          setblogData(posts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Call the fetchData function
    if(blogData.length===0){
      fetchData();
    }
 
  }, [blogData]);
  console.log('blog',blogData)
  return (
    <div>
      <div>
        <div>
          {blogData.map((blog:any) => (
            <Blog
              key={blog.id}
              show={show}
              setShow={setShow}
              blogData={blogData}
              {...blog}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;

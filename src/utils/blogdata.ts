import { useState } from 'react';

const useBlogData = () => {
    const [blogData, setblogData] = useState([
        {
          id: 1,
          display: "link1",
          date: "13-09-2023",
          content:
            "In my local language (Bahasa Indonesia) there are no verb-2 or past tense form as time tracker. So, I often forget to use the past form of verb when speaking english. I saw him last night (correct) I see him last night ...",
          comments: [
            {
              id: 1,
              display: "Hey Guys!!",
              children: [
                {
                  id: 2,
                  display: "Let's Comment",
                  children: [],
                },
                {
                  id: 3,
                  display: "What's Going on",
                  children: [],
                },
              ],
            },
          ],
        },
        {
          id: 2,
          display: "link2",
          date: "13-09-2023",
          content:
            "In my local language (Bahasa Indonesia) there are no verb-2 or past tense form as time tracker. So, I often forget to use the past form of verb when speaking english. I saw him last night (correct) I see him last night ...",
          comments: [
            {
              id: 2,
              display: "Hey Guys Second!!",
              children: [
                {
                  id: 2,
                  display: "Let's Comment",
                  children: [],
                },
                {
                  id: 3,
                  display: "What's Going on",
                  children: [],
                },
              ],
            },
          ],
        },
      ]);

      const getDataByParentId = (parentId:any) => {
        const foundData = blogData.find((data) => data.id === parentId);
        return foundData || null; // Return found data or null if not found
      };

  return {
    blogData,
    setblogData,
    getDataByParentId
  };
};

export default useBlogData;
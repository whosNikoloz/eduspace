"use client";

import React, { Key, useState, useEffect, useCallback, useMemo } from "react";
import Social from "@/app/api/Social/Post";
import { useInfiniteQuery } from "react-query";
import toast, { Toaster } from "react-hot-toast";
import CreatePost from "@/components/social/CreatePost";
import SearchSubject from "@/components/social/SearchSubject";
import PostCardSkeleton from "@/components/social/PostCardSkeleton";
import { CustomTitle } from "@/components/CustomTitle";
import { Locale } from "@/i18n.config";

const PostCard = React.lazy(() => import("@/components/social/PostCard"));

const SSRPosts = ({ params: { lang } }: { params: { lang: Locale } }) => {
  const fetchPosts = useCallback(async ({ pageParam = 1 }) => {
    const response = await Social().GetPosts(pageParam, 5);
    return {
      posts: response,
      nextPage: pageParam + 1,
      hasNextPage: response.length > 0,
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const { data, fetchNextPage, hasNextPage, isLoading, isError, isFetching } =
    useInfiniteQuery(["posts"], fetchPosts, {
      getNextPageParam: (lastPage) =>
        lastPage.hasNextPage ? lastPage.nextPage : undefined,
    });

  const [posts, setPosts] = useState<
    Array<{ postId: Key | null | undefined; subject: string }>
  >([]);

  useEffect(() => {
    if (data) {
      setPosts(data.pages.flatMap((page) => page.posts));
    }
  }, [data]);

  const handleDeletePost = (postId: any) => {
    setPosts((oldPosts) => oldPosts.filter((post) => post.postId !== postId));
    toast.success("Successfully deleted");
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    return posts.filter((post) =>
      post.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  useEffect(() => {
    const handleScrollMobile = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight &&
        hasNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchmove", handleScrollMobile);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchmove", handleScrollMobile);
    };
  }, [hasNextPage, fetchNextPage, handleScroll]);

  return (
    <>
      <SearchSubject
        searchPostFunction={setSearchQuery}
        lang={lang === "en" ? "en" : "ka"}
      />
      <br />
      {isLoading ? (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      ) : isError ? (
        <>
          <h1 className="text-center items-center p-10">API ERROR 505</h1>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      ) : (
        <>
          <CreatePost setPosts={setPosts} lang={lang} />
          {filteredPosts.map((post: { postId: Key | null | undefined }) => (
            <PostCard
              key={post.postId}
              lang={lang}
              postData={post}
              onDelete={handleDeletePost}
            />
          ))}
          {!hasNextPage && (
            <CustomTitle
              title1={
                lang == "en"
                  ? "No posts available"
                  : "პოსტები არ არის ხელმისაწვდომი"
              }
              title2={searchQuery}
              margin={14}
              direct={"center"}
            />
          )}
          {isFetching && <PostCardSkeleton />}
        </>
      )}
      <Toaster position="bottom-left" reverseOrder={false} />
    </>
  );
};

export default SSRPosts;

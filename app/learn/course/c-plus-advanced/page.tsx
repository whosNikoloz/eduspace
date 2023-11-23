"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import CoursesAPI from "@/app/api/Learn/Course";
import { useUser } from "@/app/dbcontext/UserdbContext";
import ProgressAPI from "@/app/api/Learn/Progress";
import MainLayout from "@/app/layouts/Mainlayout";
import { Hero } from "@/components/Learn/Hero";
import Subject from "@/components/Learn/subject";

interface Course {
  courseId: number;
  courseName: string;
  subjects: any;
  description: string;
  courseLogo: string;
  formattedCourseName: string;
  levelId: number;
}
interface userProgress {
  progressId: number;
  subjectId: number;
  lessonId: number;
  complete: boolean;
}

export default function CplusAdvancedPage() {
  const { user } = useUser();
  const courses = CoursesAPI();
  const [course, setCourse] = useState<Course | null>(null);
  const progresses = ProgressAPI();
  const [progress, setProgress] = useState<userProgress | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await courses.GetCourse("c-plus-advanced");
        setCourse(courseResponse);
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    fetchCourse();
  }, [user, courses]); // Fetch course when user changes

  useEffect(() => {
    if (user && course) {
      const fetchUserProgress = async () => {
        try {
          const userProgress = await progresses.GetProgress(
            { userid: user.userId },
            { courseid: course.courseId }
          );
          setProgress(userProgress);
        } catch (error) {
          console.error("Error fetching user progress:", error);
        }
      };

      fetchUserProgress(); // Fetch user progress instantly

      const intervalId = setInterval(fetchUserProgress, 30000); // Then fetch user progress every 30 seconds

      return () => clearInterval(intervalId); // Clean up on unmount or when dependencies change
    }
  }, [user, course, progresses]); // Fetch user progress when user or course changes

  return (
    <MainLayout>
      {course && (
        <>
          <div className="flex flex-col items-center justify-center ">
            <Hero
              logo={course.courseLogo}
              courseName={course.courseName}
              description={course.description}
            />
            <Subject courseData={course} userProgress={progress} />
          </div>
        </>
      )}
    </MainLayout>
  );
}

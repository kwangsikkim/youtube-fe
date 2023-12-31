import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Filednd } from "../file/Filednd";
import Editor from "../component/Editor";
import { DetectLoginContext } from "../component/LoginProvider";
import LoadingPage from "../component/LoadingPage";
import YoutubeInfo from "../component/YoutubeInfo";

function BoardWrite() {
  /* 로그인 정보 컨텍스트 */
  const { token, handleLogout, loginInfo, validateToken } =
    useContext(DetectLoginContext);

  /* use state */
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [content, setContent] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uuid, setUuid] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isYouTubeLink, setIsYouTubeLink] = useState(false);
  const [returnData, setReturnData] = useState(content);

  /* useLocation */
  const location = useLocation();

  /* 현재 쿼리스트링의 category 명 가져오기 */
  const currentParams = new URLSearchParams(location.search).get("category");

  /* use navigate */
  let navigate = useNavigate();

  /* use toast */
  const toast = useToast();

  /* ck에디터 이미지 첨부 개수 확인 */
  let imgFile = document.getElementsByTagName("figure");

  // useEffect를 사용하여 titleError가 변경(에러발생)될 때마다 스크롤이 제목 라벨으로 이동
  useEffect(() => {
    if (currentParams === null) {
      navigate("/");
    }
    // 동시에 발생했을 경우에는 title로 먼저 스크롤 된다.
    if (titleError && contentError) {
      const errorElement = document.getElementById("title");
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      if (titleError) {
        // 오류 메시지가 있을 때 해당 영역으로 스크롤 이동
        const errorElement = document.getElementById("title");
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth" });
        }
      }
      if (contentError) {
        const errorElement = document.getElementById("content");
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [titleError, contentError]);

  // title, content 의 문자열 길이가 0 이상일 경우 titleError 초기화 (타이핑 하는 순간 즉시)
  useEffect(() => {
    if (title.trim().length > 0) {
      setTitleError("");
    }

    if (content.trim().length > 0) {
      setContentError("");
    }
  }, [title, content]);

  // 작성 완료 버튼 클릭 ---------------------------------------------------
  function handleSubmit() {
    if (!token.detectLogin) {
      window.alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      navigate("/member/login");
    }

    // 제목이 null이거나 공백일 경우 에러메시지 세팅 후 반환
    if (!title || title.trim() === "") {
      setTitleError("제목을 입력해주세요. title은 null이거나 공백이면 안 됨.");
      return;
    }

    // 본문이 null이거나 공백일 경우 에러메시지 세팅 후 반환
    if (!content || content.trim() === "") {
      setContentError("본문을 입력해주세요. 본문은 null이거나 공백이면 안 됨.");
      return;
    }

    setIsSubmitting(true);

    if (imgFile.length > 5) {
      toast({
        description: "이미지 개수를 초과했습니다. (최대 5개)",
        status: "info",
      });
      let htmlContent = content; // 여기에 HTML 컨텐츠를 넣으세요.
      htmlContent = htmlContent.replace(
        /<figure[^>]*>([\s\S]*?)<\/figure>/g,
        "",
      );
      setReturnData(htmlContent);
      setIsSubmitting(false);
    }

    if (imgFile.length < 6) {
      let uuSrc = getSrc();

      // 제목이 null이거나 공백일 경우 에러메시지 세팅 후 반환
      if (!title || title.trim() === "") {
        setTitleError(
          "제목을 입력해주세요. title은 null이거나 공백이면 안 됨.",
        );
        return;
      }
      // 본문이 null이거나 공백일 경우 에러메시지 세팅 후 반환
      if (!content || content.trim() === "") {
        setContentError(
          "본문을 입력해주세요. 본문은 null이거나 공백이면 안 됨.",
        );
        return;
      }

      axios
        .postForm("/api/board/add", {
          title,
          link,
          content,
          uploadFiles,
          uuSrc,
          board_member_id: loginInfo.member_id,
          name_eng: currentParams,
          isYouTubeLink: isYouTubeLink,
        })
        .then(() => {
          toast({
            description: "게시글 저장에 성공했습니다.",
            status: "success",
          });
          navigate("/board/list?category=" + currentParams);
        })
        .catch((error) => {
          if (error.response.status === 400) {
            toast({
              description:
                "게시글 유효성 및 파일(최대 5개) 검증에 실패했습니다. 양식에 맞게 작성해주세요.",
              status: "error",
            });
            return;
          }

          if (error.response.status === 401) {
            toast({
              description: "권한 정보가 없습니다.",
              status: "error",
            });
            return;
          }

          if (error.response) {
            toast({
              description: "게시글 저장에 실패했습니다.",
              status: "error",
            });
            return;
          }
        })
        .finally(() => setIsSubmitting(false));
    }
  }

  // 본문 영역 이미지 소스 코드 얻어오기
  function getSrc() {
    let imgSrc = document.getElementsByTagName("img");
    let arrSrc = [];

    for (let i = 0; i < imgSrc.length; i++) {
      if (
        imgSrc[i].src.length > 0 &&
        imgSrc[i].src.startsWith(
          "https://mybucketcontainer1133557799.s3.ap-northeast-2.amazonaws.com/fileserver/",
        )
      ) {
        arrSrc.push(imgSrc[i].src.substring(79, 115));
      }
    }

    return arrSrc;
  }

  return (
    <Center>
      <Box m={5} w={"1000px"}>
        {/*<Box mb={5}>*/}
        {/*  <Heading>{currentParams} 게시판</Heading>*/}
        {/*</Box>*/}

        <Heading mb={5}>새 글 작성하기</Heading>

        {/* -------------------- 제목 -------------------- */}
        <FormControl mb={2} isInvalid={titleError}>
          <FormLabel id="title">제목</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="추천 게시글의 제목을 입력해주세요."
            bg={"white"}
          />
          {/* isInvalid로 타이틀이 공백이거나 null일 경우 에러메시지 출력 */}
          <FormErrorMessage>{titleError}</FormErrorMessage>
        </FormControl>

        {/* -------------------- 링크 -------------------- */}
        <FormControl my={5}>
          <FormLabel>링크</FormLabel>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="추천 영상의 링크를 입력해주세요."
            bg={"white"}
          />
          <Box my={5}>
            <Text> 썸네일 미리 보기 </Text>
            <Box w={"200px"} h={"120px"}>
              <YoutubeInfo
                link={link}
                extraThumbnail={true}
                mode={"voteLink"}
                setIsYouTubeLink={setIsYouTubeLink}
              />
            </Box>
          </Box>
        </FormControl>

        {/* -------------------- 본문 -------------------- */}
        <FormControl isInvalid={contentError}>
          <FormLabel id="content">
            <Flex>
              <Text>본문</Text>
              <Flex alignItems={"end"}>
                <Text color="gray" fontSize={"0.75rem"}>
                  (본문 내 이미지는 최대 5개 / 1개당 최대 500kb / 총 1mb)
                </Text>
              </Flex>
            </Flex>
          </FormLabel>
          {/* CKEditor 본문 영역 */}
          <Editor
            data={returnData}
            setUuid={setUuid}
            uuid={uuid}
            setContent1={setContent}
          />
          <FormErrorMessage>{contentError}</FormErrorMessage>
        </FormControl>

        {/* -------------------- 파일 첨부 -------------------- */}
        <Filednd setUploadFiles={setUploadFiles} uploadFiles={uploadFiles} />

        {/* -------------------- 버튼 섹션 -------------------- */}
        {/* 저장 버튼 */}
        <Box mt={2}>
          <Button
            onClick={handleSubmit}
            colorScheme="blue"
            isDisabled={isSubmitting}
            mr={2}
          >
            작성 완료
          </Button>

          {/* 취소 버튼 */}
          <Button
            onClick={() => navigate("/board/list?category=" + currentParams)}
            colorScheme="red"
          >
            취소
          </Button>
        </Box>
      </Box>
    </Center>

    //       <Heading mb={5}>유튜브 추천 :: 새 글 작성하기</Heading>

    //       {/* -------------------- 제목 -------------------- */}
    //       <FormControl mb={2} isInvalid={titleError}>
    //         <FormLabel id="title">제목</FormLabel>
    //         <Input
    //           value={title}
    //           onChange={(e) => setTitle(e.target.value)}
    //           placeholder="추천 게시글의 제목을 입력해주세요."
    //         />
    //         {/* isInvalid로 타이틀이 공백이거나 null일 경우 에러메시지 출력 */}
    //         <FormErrorMessage>{titleError}</FormErrorMessage>
    //       </FormControl>

    //       {/* -------------------- 링크 -------------------- */}
    //       <FormControl mb={2}>
    //         <FormLabel>링크</FormLabel>
    //         <Input
    //           value={link}
    //           onChange={(e) => setLink(e.target.value)}
    //           placeholder="추천 영상의 링크를 입력해주세요."
    //         />
    //       </FormControl>

    //       {/* -------------------- 본문 -------------------- */}
    //       <FormControl mb={2} isInvalid={contentError}>
    //         <FormLabel id="content">본문</FormLabel>
    //         {/* CKEditor 본문 영역 */}
    //         <Editor setUuid={setUuid} uuid={uuid} setContent1={setContent} />
    //         <FormErrorMessage>{contentError}</FormErrorMessage>
    //       </FormControl>

    //       {/* -------------------- 파일 첨부 -------------------- */}
    //       <Filednd setUploadFiles={setUploadFiles} uploadFiles={uploadFiles} />

    //       {/* -------------------- 버튼 섹션 -------------------- */}
    //       {/* 저장 버튼 */}
    //       <Button
    //         onClick={handleSubmit}
    //         colorScheme="blue"
    //         isDisabled={isSubmitting}
    //         mr={2}
    //       >
    //         작성 완료
    //       </Button>

    //       {/* 취소 버튼 */}
    //       <Button
    //         onClick={() => navigate("/board/list?category=" + currentParams)}
    //         colorScheme="red"
    //       >
    //         취소
    //       </Button>
    //     </Box>
  );
}

export default BoardWrite;

import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
} from "@chakra-ui/react";
import * as PropTypes from "prop-types";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { SearchMain } from "./SearchMain";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DetectLoginContext } from "../component/LoginProvider";
import MemberProfile from "../member/MemberProfile";
import * as SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { SocketContext } from "../socket/Socket";
import axios from "axios";

Stack.propTypes = {
  p: PropTypes.number,
  h: PropTypes.string,
  direction: PropTypes.string,
  children: PropTypes.node,
};

export function Nav({ setSocket }) {
  const { token, handleLogout, loginInfo, validateToken } =
    useContext(DetectLoginContext);
  let navigate = useNavigate();
  const { alarmList, setAlarmList } = useContext(SocketContext);
  const [alarm, setAlarm] = useState([]);
  const [alarmCount, setAlarmCount] = useState(null);

  useEffect(() => {
    axios
      .post("http://localhost:3000/api/websocket/alarmlist", {
        userId: localStorage.getItem("memberInfo"),
      })
      .then((res) => {
        setAlarm(res.data);
      })
      .catch()
      .finally();

    axios
      .post("http://localhost:3000/api/websocket/alarmcount", {
        userId: localStorage.getItem("memberInfo"),
      })
      .then((res) => {
        setAlarmCount(res.data);
      })
      .catch()
      .finally();
  }, []);
  console.log(alarm);
  return (
    <>
      <Flex
        ml="100px"
        mt={2}
        h="100px"
        w="80%"
        alignItems="center"
        justifyContent={"space-around"}
        bg="blackAlpha.100"
      >
        <Button
          borderStyle={"solid"}
          size="md"
          variant="ghost"
          onClick={() => {
            navigate("/");
          }}
        >
          로고
        </Button>
        <Flex>
          <Button w={120} borderStyle={"solid"} size="md" variant="ghost">
            TOP
          </Button>
          <Menu>
            <MenuButton as={Button} w={120} size="md" variant="ghost">
              게시판
              <ChevronDownIcon />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => navigate("board/list?category=notice")}>
                공지
              </MenuItem>
              <MenuItem onClick={() => navigate("board/list?category=sports")}>
                스포츠
              </MenuItem>
              <MenuItem onClick={() => navigate("board/list?category=mukbang")}>
                먹방
              </MenuItem>
              <MenuItem onClick={() => navigate("board/list?category=daily")}>
                일상
              </MenuItem>
              <MenuItem onClick={() => navigate("board/list?category=cooking")}>
                요리
              </MenuItem>
              <MenuItem onClick={() => navigate("board/list?category=movie")}>
                영화/드라마
              </MenuItem>
              <MenuItem onClick={() => navigate("board/list?category=game")}>
                게임
              </MenuItem>
              <MenuItem onClick={() => navigate("/chat")}>채팅</MenuItem>
              <Divider />
              <MenuItem onClick={() => navigate("/inquiry/list")}>
                문의게시판
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <Box>
          <SearchMain />
        </Box>

        <Flex gap={10} ml={2}>
          <Flex gap={6} justifyContent={"center"} alignItems={"center"}>
            {token.detectLogin ? (
              <>
                <Popover gutter={10}>
                  <PopoverTrigger>
                    <Button variant={"ghost"}>
                      {alarmCount > 0 ? (
                        <FontAwesomeIcon
                          fontSize={"20px"}
                          icon={faBell}
                          color="gold"
                        />
                      ) : (
                        <FontAwesomeIcon fontSize={"20px"} icon={faBell} />
                      )}
                      {alarmCount > 99 && <Text>"99..."</Text>}
                      {alarmCount === 0 || alarmCount === null ? (
                        <Text></Text>
                      ) : (
                        <Text>{alarmCount}</Text>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent w={"350px"} h={"300px"} overflowY={"scroll"}>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>
                      최근 알람 | 전부 읽음, 전부 삭제
                    </PopoverHeader>
                    {alarm.map((list) => (
                      <PopoverBody>
                        <Link to={"/board/" + list.board_id}>
                          {list.board_title}에 {list.sender_member_id}님이
                          댓글을 남겼습니다. {list.ago}
                        </Link>
                      </PopoverBody>
                    ))}
                  </PopoverContent>
                </Popover>

                <Menu w={200} size="md" variant="ghost">
                  <MenuButton>
                    <MemberProfile />
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        handleLogout();
                        navigate("/");
                      }}
                    >
                      로그아웃
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        navigate("/member/info");
                      }}
                    >
                      마이페이지
                    </MenuItem>
                    <MenuItem>준비중</MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    navigate("member/login");
                  }}
                  w={90}
                  size="md"
                  variant="ghost"
                >
                  로그인
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

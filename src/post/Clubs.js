import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../shared/Header";
import BoardBtns from "../shared/BoardBtns";
import Pagenumber from "../shared/Pagenumber";
import "./styles/Clubs.css";

function Clubs() {
  const [posts, setPosts] = useState([]);
  const [coverimages, setCoverImages] = useState();
  const [currentPosts, setCurrentPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [isWriting, setIsWriting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const handlePageChange = page => {
    setPage(page);
  };
  const [postPerPage] = useState(3);

  const IndexLastPost = page * postPerPage;
  const IndexFirstPost = IndexLastPost - postPerPage;
  const [loading, setLoading] = useState(false);
  const { post_id } = useParams();
  const [nickname, setNickname] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Invalid or missing token");
        return;
      }
      const res = await axios.get(`/dailband/boards/clubs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(res.data.posts);
      setCurrentPosts(res.data.posts.slice(IndexFirstPost, IndexLastPost));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [IndexFirstPost, IndexLastPost, page]);

  useEffect(() => {
    if (post_id) {
      async function getcoverimages(post_id) {
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
          const res = await axios.get(`/dailband/boards/clubs/${post_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setCoverImages(res.data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching post coverimages:", error);
          setLoading(false);
        }
      }
      getcoverimages(post_id);
    }
  }, [post_id]);

  const handleWriteClick = () => {
    setIsWriting(true); // 글 작성
    setIsEditing(false);
    setTitle("");
    setContent("");
    setImage(null);
    setImagePreview(null);
  };

  const handleBackClick = () => {
    setIsWriting(false); // 다시 게시판으로
    setIsEditing(false);
    setTitle("");
    setContent("");
    setImage(null);
    setImagePreview(null);
  };

  const handleTitleChange = e => {
    setTitle(e.target.value);
  };

  const handleContentChange = e => {
    setContent(e.target.value);
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log({ title, content, imagePreview });

    const updatedPost = {
      title,
      content,
      file_url: "",
      user_id: nickname,
    };
    const token = localStorage.getItem("token");
    try {
      if (isEditing) {
        await axios.put(
          `/dailband/boards/clubs/${editingPostId}`,
          updatedPost,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post("/dailband/boards/clubs", updatedPost, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      await fetchPosts();
    } catch (error) {
      console.error("Error submitting post:", error);
    }

    setIsWriting(false);
    setIsEditing(false);
  };

  const handleEditClick = post => {
    setIsEditing(true);
    setIsWriting(true);
    setEditingPostId(post.post_id);
    setTitle(post.title);
    setContent(post.content);
    setImage(null);
    setImagePreview(post.image_url);
  };

  const handleDeleteClick = async post => {
    const token = localStorage.getItem("token");
    if (window.confirm("게시글을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/dailband/boards/clubs/${post.post_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await fetchPosts();

        window.confirm("게시글이 삭제되었습니다!");
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  // 검색어 입력 시 검색어 받아오기
  const handleSearchChange = e => {
    setSearchTerm(e.target.value);
  };

  // 돋보기 버튼 클릭 시 검색어에 따른 필터링
  const handleSearchClick = () => {
    if (searchTerm.trim() === "") {
      setCurrentPosts(posts.slice(IndexFirstPost, IndexLastPost));
    } else {
      const filteredPosts = posts.filter(
        post =>
          post.title.includes(searchTerm) || post.content.includes(searchTerm)
      ); // 해당 검색어를 title 또는 content에 포함한 게시물 출력
      setCurrentPosts(filteredPosts.slice(IndexFirstPost, IndexLastPost));
    }
  };

  // 돋보기 버튼 클릭이 아닌 엔터키를 쳐도 검색이 되도록 하는 함수
  const handleKeyPress = e => {
    if (e.key === "Enter") {
      e.preventDefault(); // Enter 키를 눌렀을 때 폼 제출을 방지
      handleSearchClick();
    }
  };
  return (
    <div>
      <div className="BoardPage">
        <Header />
        <BoardBtns initialSelectedIndex={0} />
        <div className="Boards">
          {isWriting ? (
            <div>
              <button
                type="button"
                onClick={handleBackClick}
                className="Backbutton">
                <img
                  className="Backbutton"
                  alt="Backbutton"
                  src="/img/arrow.png"
                />
              </button>
              <form onSubmit={handleSubmit}>
                <div className="ImgUpload">
                  {imagePreview && (
                    <img src={imagePreview} alt="ImagePreview" width="300px" />
                  )}
                  <label>
                    이미지 업로드:
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                <div className="TextUpload">
                  <input
                    type="text"
                    className="InputTitle"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="밴드 이름 : 제목"
                    required
                  />

                  <textarea
                    className="InputContent"
                    value={content}
                    onChange={handleContentChange}
                    placeholder="학교명, 인원수, 좋아하는 밴드 스타일 등을 적어주시면 좋아요!"
                    required
                    style={{ height: "280px" }}></textarea>
                  <div className="EditBtns">
                    <button type="button" onClick={handleBackClick}>
                      취소
                    </button>
                    <button type="submit" className="SubmitBtn">
                      {isEditing ? "수정하기" : "작성하기"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="Searchbox">
                <input
                  placeholder=" 검색어를 입력해주세요!"
                  value={searchTerm} // 검색어 상태 바인딩
                  onChange={handleSearchChange} // 입력 변경 핸들러 추가
                  onKeyDown={handleKeyPress} //Enter키 핸들러
                ></input>
                <span>
                  <img
                    src="/img/searchicon.png"
                    alt="searchicon"
                    onClick={handleSearchClick} // 검색 버튼 클릭 핸들러 추가
                    style={{ cursor: "pointer" }}></img>
                </span>
              </div>

              <button
                className="WriteBtn"
                onClick={handleWriteClick}
                style={{
                  marginLeft: "1270px",
                  marginTop: "410px",
                  cursor: "pointer",
                }}>
                글쓰기
              </button>
              <div className="Clubpost">
                {currentPosts.slice(0, 3).map(post => (
                  <Link
                    to={`/boards/clubs/${post.post_id}`}
                    style={{ textDecoration: "none" }}
                    key={post.post_id}>
                    <div className="Postbox">
                      <div>
                        <img
                          className="clubimg"
                          src={
                            coverimages?.file_url
                              ? coverimages.file_url
                              : "/img/basicprofile.png"
                          }
                          alt="clubimg"
                        />
                      </div>
                      <div className="contentbox">
                        <div className="Boardname">
                          <h3 style={{ color: "rgb(51,0,119)" }}>
                            동아리 모집 게시판
                          </h3>
                          <div className="ModifyBtns">
                            <button
                              type="button"
                              onClick={e => {
                                e.preventDefault(); // Link 컴포넌트 링크 이동 방지
                                handleEditClick(post);
                              }}>
                              <img src="/img/edit.png" alt="edit" />
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.preventDefault();
                                handleDeleteClick(post);
                              }}>
                              <img src="/img/trash.png" alt="trash" />
                            </button>
                          </div>
                        </div>

                        <h3>{post.title}</h3>
                        <p>
                          {post.content.length > 80
                            ? `${post.content.slice(0, 80)}...`
                            : post.content}
                        </p>

                        <div></div>
                        <p className="Posttime">작성날짜 {post.created_at}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Pagenumber
                totalCount={posts.length}
                page={page}
                postPerPage={postPerPage}
                pageRangeDisplayed={10}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Clubs;

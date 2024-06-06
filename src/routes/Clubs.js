import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import BoardBtns from "../components/BoardBtns";
import Pagenumber from "../components/Pagenumber";
import "./Clubs.css";

function Clubs() {
  const [posts, setPosts] = useState([]);
  const [currentPosts, setCurrentPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const handlePageChange = (page) => {
    setPage(page);
  };
  const [postPerPage] = useState(3);

  const IndexLastPost = page * postPerPage;
  const IndexFirstPost = IndexLastPost - postPerPage;
  const [loading, setLoading] = useState(false);

  // cd public
  //cd data
  //json-server --watch sample0.json --port 3003

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const res = await axios.get("http://localhost:3003/posts");
      setPosts(res.data);
      setCurrentPosts(posts.slice(IndexFirstPost, IndexLastPost));
      setLoading(false);
    };
    fetchPosts();
  }, [currentPosts, IndexFirstPost, IndexLastPost, page]);

  const handleWriteClick = () => {
    setIsWriting(true); // 글 작성
  };

  const handleBackClick = () => {
    setIsWriting(false); // 다시 게시판으로
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to submit the new post, including the image file
    console.log({ title, content, image });
    setIsWriting(false);
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
                className="Backbutton"
              >
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
                    style={{"height":"280px"}}
                  ></textarea>

                  <button type="submit" className="SubmitBtn">
                    작성하기
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <button className="WriteBtn" onClick={handleWriteClick} style={{"marginLeft": "1270px", "marginTop" : "400px"}}>
                글쓰기
              </button>
                <div className="Clubpost">
                
                {currentPosts.slice(0, 3).map((post) => (
                  <Link
                  to={`/boards/clubs/${post.post_id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    key={post.post_id}
                    className="Postbox"
                  >
                    <div className="clubimg">photo</div>
                    <div className="contentbox">
                      <h3>{post.title}</h3>
                      <p>
                        {post.content.length > 80
                          ? `${post.content.slice(0, 80)}...`
                          : post.content}
                      </p>
                      <div className="Likebox">
                        <img
                          className="Likes"
                          src="/img/Likes.png"
                          alt="Likes"
                        ></img>
                        <p className="Likenum">507</p>
                      </div>

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

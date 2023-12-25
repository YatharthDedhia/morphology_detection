import './posts.css'
import React from 'react';

const PostContainer = ({ post, index, newComment, comments, handleCommentChange, handleAddComment, handleLike }) => {
  // console.log(post.src)
  return (
    <div key={index} className="post">
      <img src={post.src} alt={`Uploaded ${index}`} />
      <div className="post-details">
        <button className="like-button" onClick={handleLike}>
          ❤️
        </button>
        <h3>Likes</h3>
        <div className="like-section">
          <span className="like-count">{post.likes}</span>
        </div>
        <p>{post.caption}</p>
        <p>{post.dateTime}</p>
      </div>

      <div className="comment-section">
        <input
          type="text"
          placeholder="Add a comment"
          value={newComment}
          onChange={handleCommentChange}
          className="comment-input"
        />
        <button
          onClick={() => handleAddComment(index)}
          className="comment-button"
        >
          Add Comment
        </button>
      </div>

      {comments
        .filter((comment) => comment.index === index)
        .map((comment, commentIndex) => (
          <div key={commentIndex} className="comment">
            {comment.text}
          </div>
        ))}
    </div>
  );
};

export default PostContainer;

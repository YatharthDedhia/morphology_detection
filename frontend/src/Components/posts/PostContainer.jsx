import React from 'react';
import './posts.css';

const PostContainer = ({
  post,
  index,
  newComment,
  comments,
  handleCommentChange,
  handleAddComment,
  handleLike
}) => {
  // Render each post with its details and comments
  return (
    <div key={index} className="post">
      {/* Post image */}
      <img src={post.src} alt={`Uploaded ${index}`} />

      {/* Post details section */}
      <div className="post-details">
        {/* Like button */}
        <button className="like-button" onClick={handleLike}>
          ❤️
        </button>

        {/* Display like count */}
        <h3>Likes</h3>
        <div className="like-section">
          <span className="like-count">{post.likes}</span>
        </div>

        {/* Post caption and timestamp */}
        <p>{post.caption}</p>
        <p>{post.dateTime}</p>
      </div>

      {/* Comment section */}
      <div className="comment-section">
        {/* Input for adding a new comment */}
        <input
          type="text"
          placeholder="Add a comment"
          value={newComment}
          onChange={handleCommentChange}
          className="comment-input"
        />

        {/* Button to add a new comment */}
        <button
          onClick={() => handleAddComment(index)}
          className="comment-button"
        >
          Add Comment
        </button>
      </div>

      {/* Display comments for the specific post */}
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

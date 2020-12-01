import React, { useState } from 'react'
import CommentsView from '../CommentsView'
import './style.css'

const CommentList = ({ user, comments, editable, onSubmit }) => {
  const [content, setContent] = useState('')

  const handleChange = e => {
    setContent(e.target.value)
  }

  const submitComment = () => {
    const comment = JSON.stringify({
      author: user.userId,
      content: content,
      updateAt: new Date().getTime()
    })
    onSubmit(comment)
  }

  return (
    <div className="commentList">
      <div className="title">評論</div>
      {editable && (
        <div className="editor">
          <textarea
            placeholder="説説你的看法"
            value={content}
            onChange={handleChange}
          />
          <button onClick={submitComment}>提交</button>
        </div>
      )}
      <CommentsView comments={comments} />
    </div>
  )
}

export default CommentList
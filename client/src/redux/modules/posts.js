import { combineReducers } from 'redux'
import { call } from '../../utils/request'
import url from '../../utils/url'
import { actions as appActions } from './app'

const initialState = {
  byId: {
    0: {
      id: 0,
      author: 123,
      title: "first",
      content: "first content",
      updateAt: 1317826080000,
      vote: 0,
    },
    2: {
      id: 2,
      author: 223,
      title: "second",
      content: "second content",
      updateAt: 1317896088888,
      vote: 0,
    },
  },
  allIds: [0, 2],
};

export const types = {
  FETCH_POST_LIST: "POSTS/FETCH_POST_LIST",
  FETCH_POST_BY_PID: "POSTS/FETCH_POST_BY_PID",
  CREATE_POST: "POSTS/CREATE_POST",
  UPDATE_POST: "POSTS/UPDATE_POST",
  DELETE_POST: "POSTS/DELETE_POST",
}

export const actions = {
  fetchPostList: () => {
    return (dispatch, getState) => {
      if (shouldFetchPostList(getState())) {
        dispatch(appActions.startRequest())
        return call(url.getPostList()).then(data => {
          dispatch(appActions.finishRequest())
          if (!data.error) {
            const { posts, postIds, authors } = convertPostsToPlain(data)
            dispatch(fetchPostListSuccess(posts, postIds, authors))
          } else {
            dispatch(appActions.setError(data.error))
          }
        })
      }
    }
  },
  fetchPostById: pid => {
    return (dispatch, getState) => {
      if (shouldFetchPost(pid, getState())) {
        dispatch(appActions.startRequest())
        return call(url.getPostById(pid)).then(data => {
          dispatch(appActions.finishRequest())
          if (!data.error && data.length === 1) {
            const { post, author } = convertPostToPlain(data[0])
            dispatch(fetchPostSuccess(post, author))
          } else {
            dispatch(appActions.setError(data.error))
          }
        })
      }
    }
  },
  createPost: (title, content) => {
    return (dispatch, getState) => {
      const state = getState()
      const author = state.auth.userId
      const params = JSON.stringify({
        author,
        title,
        content,
        updateAt: new Date().getTime(),
        vote: 0
      })
      dispatch(appActions.startRequest())
      return call(url.createPost(), "POST", params).then(data => {
        dispatch(appActions.finishRequest())
        if (!data.error) {
          dispatch(createPostSuccess(data))
        } else {
          dispatch(appActions.setError(data.error))
        }
      })
    }
  },
  updatePost: (id, post) => {
    return dispatch => {
      dispatch(appActions.startRequest())
      return call(url.updatePost(id), "POST", post).then(data => {
        dispatch(appActions.finishRequest())
        if (!data.error) {
          dispatch(updatePostSuccess(data))
        } else {
          dispatch(appActions.setError(data.error))
        }
      })
    }
  }
}

// success
const fetchPostListSuccess = (posts, postIds, authors) => ({
  type: types.FETCH_POST_LIST,
  posts,
  postIds,
  users: authors
});

const fetchPostSuccess = (post, author) => ({
  type: types.FETCH_POST_BY_PID,
  post,
  user: author
})

const createPostSuccess = post => ({
  type: types.CREATE_POST,
  post
})

const updatePostSuccess = post => ({
  type: types.UPDATE_POST,
  post
})

// shoulds ?
const shouldFetchPostList = state => {
  return !state.posts.allIds || state.posts.byId.length === 0
}

const shouldFetchPost = (id, state) => {
  return !state.posts.byId[id] || !state.posts.byId[id].content
}

// convert
const convertPostsToPlain = posts => {
  let postsById = {}
  let postIds = []
  let authorsById = {}
  posts.forEach(item => {
    postsById[item.id] = { ...item, author: item.author.id }
    postIds.push(item.id)
    if (!authorsById[item.author.id]) {
      authorsById[item.author.id] = item.author
    }
  })
  return {
    posts: postsById,
    postIds,
    authors: authorsById
  }
}

const convertPostToPlain = post => {
  const plainPost = { ...post, author: post.author.id }
  const author = { ...post.author }
  return {
    post: plainPost,
    author
  }
}

// reducers
const allIds = (state = initialState.allIds, action) => {
  switch (action.type) {
    case types.GET_POST_LIST:
      return action.postIds
    case types.CREATE_POST:
      return [action.post.id, ...state]
    default:
      return state
  }
}

const byId = (state = initialState.byId, action) => {
  switch (action.type) {
    case types.GET_POST_LIST:
      return action.posts;
    case types.GET_POST_BY_PID:
    case types.CREATE_POST:
    case types.UPDATE_POST:
      return {
        ...state,
        [action.post.id]: action.post
      }
    default:
      return state
  }
}

const reducer = combineReducers({
  allIds,
  byId
})

export default reducer

// GSSM
export const getPostIds = state => state.posts.allIds

export const getPostList = state => state.posts.byId

export const getPostById = (state, id) => state.posts.byId[id]
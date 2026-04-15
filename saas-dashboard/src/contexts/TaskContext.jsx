import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const TaskContext = createContext({})

export const useTasks = () => useContext(TaskContext)

// ── Reducer ──
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        )
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload)
      }
    case 'SET_BOARD':
      return { ...state, board: action.payload }
    case 'SET_BOARDS':
      return { ...state, boards: action.payload }
    default:
      return state
  }
}

const initialState = {
  tasks: [],
  board: null,
  boards: [],
  loading: true,
}

// ── Activity Logger helper ──
const logActivity = async ({ boardId, userId, action, taskTitle, fromStatus, toStatus }) => {
  try {
    await supabase.from('activity_log').insert({
      board_id: boardId,
      user_id: userId,
      action,
      task_title: taskTitle,
      from_status: fromStatus || null,
      to_status: toStatus || null,
    })
  } catch (err) {
    // Silently fail — activity log is non-critical
    console.warn('Activity log error:', err)
  }
}

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const { user } = useAuth()

  // ── Fetch All Boards ──
  const fetchBoards = useCallback(async () => {
    if (!user) return []

    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching boards:', error)
      return []
    }

    dispatch({ type: 'SET_BOARDS', payload: data || [] })
    return data || []
  }, [user])

  // ── Fetch or Create Board ──
  const initializeBoard = useCallback(async () => {
    if (!user) return

    const boards = await fetchBoards()
    let board = boards[0]

    // Create default board if none exists
    if (!board) {
      const { data: newBoard, error: createErr } = await supabase
        .from('boards')
        .insert({ user_id: user.id, name: 'My Board' })
        .select()
        .single()

      if (createErr) {
        console.error('Error creating board:', createErr)
        return
      }

      board = newBoard
      dispatch({ type: 'SET_BOARDS', payload: [board] })

      // Create onboarding sample tasks
      const sampleTasks = [
        {
          board_id: board.id,
          user_id: user.id,
          title: 'Welcome to FlowBoard! 👋',
          description: 'This is a sample task. Click on it to edit, or drag it to another column.',
          status: 'todo',
          priority: 'medium',
          label: 'getting-started',
          position: 0,
        },
        {
          board_id: board.id,
          user_id: user.id,
          title: 'Try creating a new task',
          description: 'Click the "+ New Task" button in the header or press "C" on your keyboard.',
          status: 'backlog',
          priority: 'low',
          label: 'tutorial',
          position: 0,
        },
        {
          board_id: board.id,
          user_id: user.id,
          title: 'Drag tasks between columns',
          description: 'Grab a card and move it to change its status. Try moving this to "Done"!',
          status: 'in_progress',
          priority: 'high',
          label: 'tutorial',
          position: 0,
        },
      ]

      await supabase.from('tasks').insert(sampleTasks)
    }

    dispatch({ type: 'SET_BOARD', payload: board })
    return board
  }, [user, fetchBoards])

  // ── Fetch Tasks ──
  const fetchTasks = useCallback(async (boardId) => {
    if (!boardId) return

    dispatch({ type: 'SET_LOADING', payload: true })

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
    } else {
      dispatch({ type: 'SET_TASKS', payload: data })
    }
  }, [])

  // ── Initialize on mount ──
  useEffect(() => {
    const init = async () => {
      const board = await initializeBoard()
      if (board) {
        await fetchTasks(board.id)
      }
    }
    init()
  }, [initializeBoard, fetchTasks])

  // ── Realtime Subscription ──
  useEffect(() => {
    if (!state.board) return

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `board_id=eq.${state.board.id}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          switch (eventType) {
            case 'INSERT':
              dispatch({ type: 'ADD_TASK', payload: newRecord })
              break
            case 'UPDATE':
              dispatch({ type: 'UPDATE_TASK', payload: newRecord })
              break
            case 'DELETE':
              dispatch({ type: 'DELETE_TASK', payload: oldRecord.id })
              break
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [state.board])

  // ── Board Management ──
  const switchBoard = useCallback(async (boardId) => {
    const targetBoard = state.boards.find(b => b.id === boardId)
    if (!targetBoard) return

    dispatch({ type: 'SET_BOARD', payload: targetBoard })
    await fetchTasks(targetBoard.id)
    toast.success(`Switched to "${targetBoard.name}"`)
  }, [state.boards, fetchTasks])

  const createBoard = useCallback(async (name) => {
    if (!user) return

    const { data, error } = await supabase
      .from('boards')
      .insert({ user_id: user.id, name })
      .select()
      .single()

    if (error) {
      console.error('Error creating board:', error)
      toast.error('Failed to create board')
      return
    }

    dispatch({ type: 'SET_BOARDS', payload: [...state.boards, data] })
    dispatch({ type: 'SET_BOARD', payload: data })
    dispatch({ type: 'SET_TASKS', payload: [] })
    dispatch({ type: 'SET_LOADING', payload: false })
    toast.success(`Board "${name}" created`)
  }, [user, state.boards])

  const renameBoard = useCallback(async (boardId, newName) => {
    const { error } = await supabase
      .from('boards')
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq('id', boardId)

    if (error) {
      console.error('Error renaming board:', error)
      toast.error('Failed to rename board')
      return
    }

    dispatch({
      type: 'SET_BOARDS',
      payload: state.boards.map(b => b.id === boardId ? { ...b, name: newName } : b)
    })

    if (state.board?.id === boardId) {
      dispatch({ type: 'SET_BOARD', payload: { ...state.board, name: newName } })
    }

    toast.success('Board renamed')
  }, [state.boards, state.board])

  const deleteBoard = useCallback(async (boardId) => {
    if (state.boards.length <= 1) {
      toast.error('Cannot delete the only board')
      return
    }

    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId)

    if (error) {
      console.error('Error deleting board:', error)
      toast.error('Failed to delete board')
      return
    }

    const remaining = state.boards.filter(b => b.id !== boardId)
    dispatch({ type: 'SET_BOARDS', payload: remaining })

    // If we deleted the active board, switch to the first remaining one
    if (state.board?.id === boardId && remaining.length > 0) {
      dispatch({ type: 'SET_BOARD', payload: remaining[0] })
      await fetchTasks(remaining[0].id)
    }

    toast.success('Board deleted')
  }, [state.boards, state.board, fetchTasks])

  // ── CRUD Operations ──
  const createTask = useCallback(async ({ title, description, status = 'backlog', priority = 'medium', label, due_date }) => {
    if (!state.board || !user) return

    // Calculate next position
    const tasksInColumn = state.tasks.filter(t => t.status === status)
    const nextPosition = tasksInColumn.length

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        board_id: state.board.id,
        user_id: user.id,
        title,
        description: description || '',
        status,
        priority,
        label: label || null,
        due_date: due_date || null,
        position: nextPosition,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
      return null
    }

    // Log activity
    logActivity({
      boardId: state.board.id,
      userId: user.id,
      action: 'created',
      taskTitle: title,
      toStatus: status,
    })

    toast.success('Task created')
    return data
  }, [state.board, state.tasks, user])

  const updateTask = useCallback(async (taskId, updates) => {
    const oldTask = state.tasks.find(t => t.id === taskId)

    const { error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
      return false
    }

    // Log activity for status changes
    if (oldTask && updates.status && updates.status !== oldTask.status) {
      logActivity({
        boardId: state.board?.id,
        userId: user?.id,
        action: 'moved',
        taskTitle: updates.title || oldTask.title,
        fromStatus: oldTask.status,
        toStatus: updates.status,
      })
    } else if (oldTask && user) {
      logActivity({
        boardId: state.board?.id,
        userId: user.id,
        action: 'updated',
        taskTitle: updates.title || oldTask.title,
      })
    }

    toast.success('Task updated')
    return true
  }, [state.tasks, state.board, user])

  const moveTask = useCallback(async (taskId, newStatus, newPosition) => {
    const oldTask = state.tasks.find(t => t.id === taskId)

    // Optimistic update
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: taskId, status: newStatus, position: newPosition }
    })

    const { error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        position: newPosition,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) {
      console.error('Error moving task:', error)
      toast.error('Failed to move task')
      // Refetch to revert
      fetchTasks(state.board.id)
      return
    }

    // Log move activity
    if (oldTask && oldTask.status !== newStatus && user) {
      logActivity({
        boardId: state.board?.id,
        userId: user.id,
        action: 'moved',
        taskTitle: oldTask.title,
        fromStatus: oldTask.status,
        toStatus: newStatus,
      })
    }
  }, [state.board?.id, state.tasks, fetchTasks, user])

  const deleteTask = useCallback(async (taskId) => {
    // Find the task before deleting (for undo)
    const taskToDelete = state.tasks.find(t => t.id === taskId)

    // Optimistic delete
    dispatch({ type: 'DELETE_TASK', payload: taskId })

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
      // Re-add the task on error
      if (taskToDelete) {
        dispatch({ type: 'ADD_TASK', payload: taskToDelete })
      }
      return
    }

    // Log delete activity
    if (taskToDelete && user) {
      logActivity({
        boardId: state.board?.id,
        userId: user.id,
        action: 'deleted',
        taskTitle: taskToDelete.title,
      })
    }

    toast.success(
      (t) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Task deleted
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              // Re-insert the task
              const { id, ...rest } = taskToDelete
              await supabase.from('tasks').insert({ ...rest, id })
            }}
            style={{
              background: 'none',
              border: '1px solid currentColor',
              borderRadius: '4px',
              padding: '2px 8px',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: '12px',
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: 5000 }
    )
  }, [state.tasks, state.board, user])

  // ── Helpers ──
  const getTasksByStatus = useCallback((status) => {
    return state.tasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position)
  }, [state.tasks])

  const value = useMemo(() => ({
    tasks: state.tasks,
    board: state.board,
    boards: state.boards,
    loading: state.loading,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    getTasksByStatus,
    fetchTasks,
    switchBoard,
    createBoard,
    renameBoard,
    deleteBoard,
  }), [state.tasks, state.board, state.boards, state.loading, createTask, updateTask, moveTask, deleteTask, getTasksByStatus, fetchTasks, switchBoard, createBoard, renameBoard, deleteBoard])

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

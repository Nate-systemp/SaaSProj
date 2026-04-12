import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
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
    default:
      return state
  }
}

const initialState = {
  tasks: [],
  board: null,
  loading: true,
}

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const { user } = useAuth()

  // ── Fetch or Create Board ──
  const initializeBoard = useCallback(async () => {
    if (!user) return

    // Try to find existing board
    const { data: boards, error: fetchErr } = await supabase
      .from('boards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)

    if (fetchErr) {
      console.error('Error fetching boards:', fetchErr)
      return
    }

    let board = boards?.[0]

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
  }, [user])

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

  // ── CRUD Operations ──
  const createTask = async ({ title, description, status = 'backlog', priority = 'medium', label, due_date }) => {
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

    toast.success('Task created')
    return data
  }

  const updateTask = async (taskId, updates) => {
    const { error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
      return false
    }

    toast.success('Task updated')
    return true
  }

  const moveTask = async (taskId, newStatus, newPosition) => {
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
    }
  }

  const deleteTask = async (taskId) => {
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
  }

  // ── Helpers ──
  const getTasksByStatus = (status) => {
    return state.tasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position)
  }

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        board: state.board,
        loading: state.loading,
        createTask,
        updateTask,
        moveTask,
        deleteTask,
        getTasksByStatus,
        fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

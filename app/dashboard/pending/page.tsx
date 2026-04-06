'use client'

import { useState, useEffect } from 'react'
import {
  Clock,
  Check,
  X,
  Edit2,
  RefreshCw,
  Loader2,
  Save,
  ArrowUpRight,
} from 'lucide-react'
import { getRelativeTime } from '@/lib/utils'

interface SyncItem {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  dueDate: string | null
  priority: number | null
  gmailAccount: { email: string }
  taskAccount: { platform: string; workspaceName: string | null } | null
}

interface TaskAccount {
  id: string
  platform: string
  workspaceName: string | null
}

const priorityConfig: Record<number, { label: string }> = {
  4: { label: '高' },
  3: { label: '中高' },
  2: { label: '中' },
  1: { label: '低' },
}

const platformLabels: Record<string, string> = {
  FEISHU: '飞书',
  NOTION: 'Notion',
}

interface EditFormData {
  title: string
  description: string
  priority: number
  dueDate: string
}

export default function PendingPage() {
  const [items, setItems] = useState<SyncItem[]>([])
  const [taskAccounts, setTaskAccounts] = useState<TaskAccount[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormData>({
    title: '',
    description: '',
    priority: 2,
    dueDate: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, accountsRes] = await Promise.all([
          fetch('/api/tasks?status=PENDING&limit=50'),
          fetch('/api/task-accounts'),
        ])
        if (tasksRes.ok) {
          const data = await tasksRes.json()
          setItems(data.tasks || [])
        }
        if (accountsRes.ok) {
          const data = await accountsRes.json()
          setTaskAccounts(data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => {
        const p = item.priority || 2
        if (filter === 'high') return p >= 4
        if (filter === 'medium') return p === 3 || p === 2
        if (filter === 'low') return p === 1
        return true
      })

  const toggleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item.id))
    }
  }

  async function handleSync(taskId: string, taskAccountId?: string) {
    setSyncing(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}/sync`, { method: 'POST' })
      if (response.ok) {
        setItems(items.filter(t => t.id !== taskId))
        setSelectedItems(selectedItems.filter(id => id !== taskId))
      } else {
        const error = await response.json()
        alert(`同步失败: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to sync task:', error)
      alert('同步失败，请重试')
    } finally {
      setSyncing(null)
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm('确定要忽略这个任务吗？')) return
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (response.ok) {
        setItems(items.filter(t => t.id !== taskId))
        setSelectedItems(selectedItems.filter(id => id !== taskId))
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  function openEditModal(item: SyncItem) {
    setEditingItem(item.id)
    setEditForm({
      title: item.title,
      description: item.description || '',
      priority: item.priority || 2,
      dueDate: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
    })
  }

  function closeEditModal() {
    setEditingItem(null)
    setEditForm({ title: '', description: '', priority: 2, dueDate: '' })
  }

  async function handleSaveEdit(taskId: string) {
    setSaving(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          priority: editForm.priority,
          dueDate: editForm.dueDate || null,
        }),
      })
      if (response.ok) {
        const updated = await response.json()
        setItems(items.map(item =>
          item.id === taskId ? { ...item, ...updated } : item
        ))
        closeEditModal()
      } else {
        const error = await response.json()
        alert(`保存失败: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to save edit:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function handleBatchSync() {
    if (selectedItems.length === 0) return
    const defaultAccount = taskAccounts[0]
    if (!defaultAccount) {
      alert('请先添加任务平台账户')
      return
    }

    setSyncing('batch')
    try {
      for (const id of selectedItems) {
        await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskAccountId: defaultAccount.id }),
        })
        await fetch(`/api/tasks/${id}/sync`, { method: 'POST' })
      }
      const response = await fetch('/api/tasks?status=PENDING&limit=50')
      if (response.ok) {
        const data = await response.json()
        setItems(data.tasks || [])
      }
      setSelectedItems([])
    } catch (error) {
      console.error('Batch sync error:', error)
      alert('批量同步失败，请重试')
    } finally {
      setSyncing(null)
    }
  }

  async function handleBatchIgnore() {
    if (selectedItems.length === 0) return
    if (!confirm(`确定要忽略选中的 ${selectedItems.length} 个任务吗？`)) return

    try {
      for (const id of selectedItems) {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      }
      setItems(items.filter(t => !selectedItems.includes(t.id)))
      setSelectedItems([])
    } catch (error) {
      console.error('Batch ignore error:', error)
      alert('批量忽略失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#C15F3C] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div className="border-b border-[#EBE9E4] bg-white">
        <div className="max-w-5xl mx-auto px-10 py-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.2em] mb-2">
                任务确认
              </p>
              <h1 className="text-[36px] font-medium text-[#1A1918] tracking-[-0.02em]">
                待确认
              </h1>
              <p className="mt-2 text-[14px] text-[#6B6966]">
                AI 识别的待办事项，确认后同步到任务平台
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-[12px] font-medium tracking-wide rounded-lg transition-all duration-200 ${
                    filter === f
                      ? 'bg-[#1A1918] text-white'
                      : 'border border-[#EBE9E4] text-[#6B6966] hover:border-[#1A1918] hover:text-[#1A1918]'
                  }`}
                >
                  {f === 'all' ? '全部' : f === 'high' ? '高优先级' : f === 'medium' ? '中优先级' : '低优先级'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="border-b border-[#EBE9E4] bg-white">
        <div className="max-w-5xl mx-auto px-10 py-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={selectAll}
                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                  selectedItems.length === filteredItems.length && filteredItems.length > 0
                    ? 'bg-[#1A1918] border-[#1A1918]'
                    : 'border-[#D4D2CD] group-hover:border-[#1A1918]'
                }`}
              >
                {selectedItems.length === filteredItems.length && filteredItems.length > 0 && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-[12px] text-[#6B6966] group-hover:text-[#1A1918] transition-colors">
                {selectedItems.length > 0 ? `已选 ${selectedItems.length} 项` : '全选'}
              </span>
            </label>

            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchSync}
                  disabled={syncing === 'batch'}
                  className="inline-flex items-center gap-2 bg-[#1A1918] text-white px-5 py-2 rounded-lg text-[12px] font-medium tracking-wide hover:bg-[#2D2B29] disabled:opacity-50 transition-colors"
                >
                  {syncing === 'batch' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  批量确认
                </button>
                <button
                  onClick={handleBatchIgnore}
                  className="inline-flex items-center gap-2 border border-[#EBE9E4] text-[#6B6966] px-5 py-2 rounded-lg text-[12px] font-medium tracking-wide hover:border-[#B85450] hover:text-[#B85450] transition-colors"
                >
                  <X className="w-4 h-4" />
                  批量忽略
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-10 py-8">
        <div className="bg-white border border-[#EBE9E4] rounded-xl">
          {filteredItems.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <div className="w-12 h-12 border border-[#4A7C59] flex items-center justify-center mx-auto mb-4">
                <Check className="w-5 h-5 text-[#4A7C59]" />
              </div>
              <p className="text-[20px] font-medium text-[#1A1918] mb-2">
                {filter === 'all' ? '太棒了' : '没有待处理项'}
              </p>
              <p className="text-[13px] text-[#9E9C98]">
                {filter === 'all' ? '所有待办事项已处理完毕' : '当前筛选条件下没有待确认的任务'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EFEB]">
              {filteredItems.map((item) => {
                const priority = item.priority || 2
                const priorityInfo = priorityConfig[priority] || priorityConfig[2]
                const syncingThis = syncing === item.id

                return (
                  <div
                    key={item.id}
                    className="px-8 py-6 hover:bg-[#FAFAF8] transition-colors"
                  >
                    <div className="flex items-start gap-6">
                      {/* Checkbox */}
                      <div
                        onClick={() => toggleSelect(item.id)}
                        className={`mt-1 w-4 h-4 border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                          selectedItems.includes(item.id)
                            ? 'bg-[#1A1918] border-[#1A1918]'
                            : 'border-[#D4D2CD] hover:border-[#1A1918]'
                        }`}
                      >
                        {selectedItems.includes(item.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Priority */}
                          <span className={`text-[11px] font-medium ${
                            priority >= 4 ? 'text-[#B85450]' : priority >= 2 ? 'text-[#6B6966]' : 'text-[#9E9C98]'
                          }`}>
                            {priorityInfo.label}优先级
                          </span>

                          {item.dueDate && (
                            <span className="text-[11px] text-[#9E9C98] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.dueDate).toLocaleDateString('zh-CN')}
                            </span>
                          )}

                          <span className="text-[11px] text-[#B1ADA1]">
                            {getRelativeTime(item.createdAt)}
                          </span>
                        </div>

                        <h3 className="text-[15px] font-medium text-[#1A1918] mb-1">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-[13px] text-[#6B6966] mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <p className="text-[11px] text-[#9E9C98]">
                          来自 {item.gmailAccount.email}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-[#9E9C98] hover:text-[#1A1918] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {taskAccounts.length > 1 && (
                          <select
                            className="border border-[#EBE9E4] px-3 py-1.5 text-[12px] text-[#6B6966] focus:outline-none focus:border-[#1A1918]"
                            onChange={(e) => {
                              const taskId = e.target.value
                              if (taskId) handleSync(item.id, taskId)
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>选择平台</option>
                            {taskAccounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {platformLabels[acc.platform] || acc.platform}
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          onClick={() => handleSync(item.id)}
                          disabled={syncingThis}
                          className="p-2 bg-[#1A1918] text-white hover:bg-[#2D2B29] disabled:opacity-50 transition-colors"
                        >
                          {syncingThis ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-[#9E9C98] hover:text-[#B85450] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-8 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-[#1A1918]">编辑任务</h3>
              <button onClick={closeEditModal} className="text-[#9E9C98] hover:text-[#1A1918] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                  描述
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                    优先级
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: Number(e.target.value) })}
                    className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                  >
                    <option value={1}>低</option>
                    <option value={2}>中</option>
                    <option value={3}>中高</option>
                    <option value={4}>高</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                    截止日期
                  </label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeEditModal}
                className="flex-1 py-3 border border-[#EBE9E4] text-[#6B6966] text-[13px] font-medium hover:border-[#1A1918] hover:text-[#1A1918] transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleSaveEdit(editingItem)}
                disabled={saving || !editForm.title.trim()}
                className="flex-1 py-3 bg-[#1A1918] text-white text-[13px] font-medium hover:bg-[#2D2B29] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

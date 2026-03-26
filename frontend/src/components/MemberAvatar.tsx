import { Crown, User } from 'lucide-react'
import type { User as UserType, ProjectRole } from 'shared'

interface MemberAvatarProps {
  user: Pick<UserType, 'id' | 'name' | 'email'>
  role?: ProjectRole
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showOnlineStatus?: boolean
  isOnline?: boolean
  showTooltip?: boolean
  className?: string
}

export default function MemberAvatar({
  user,
  role,
  size = 'md',
  showOnlineStatus = false,
  isOnline = false,
  showTooltip = true,
  className = '',
}: MemberAvatarProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6 text-xs'
      case 'sm': return 'w-8 h-8 text-sm'
      case 'md': return 'w-10 h-10 text-base'
      case 'lg': return 'w-12 h-12 text-lg'
      default: return 'w-10 h-10 text-base'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleIcon = () => {
    if (role === 'owner') {
      return (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border border-white dark:border-[var(--bg-primary)]">
          <Crown className="w-2.5 h-2.5 text-white" />
        </div>
      )
    }
    return null
  }

  const getOnlineStatus = () => {
    if (!showOnlineStatus) return null

    return (
      <div className="absolute -bottom-0.5 -right-0.5">
        <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-[var(--bg-primary)] ${
          isOnline
            ? 'bg-emerald-500'
            : 'bg-gray-300 dark:bg-gray-600'
        }`} />
      </div>
    )
  }

  const avatarContent = (
    <div className={`relative ${className}`}>
      <div
        className={`avatar ${getSizeClasses()} bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]`}
        title={showTooltip ? `${user.name}${user.email ? `\n${user.email}` : ''}` : undefined}
      >
        {getInitials(user.name)}
      </div>
      {getRoleIcon()}
      {getOnlineStatus()}
    </div>
  )

  if (showTooltip) {
    return (
      <div className="group relative">
        {avatarContent}
        <div className="tooltip -bottom-8 left-1/2 -translate-x-1/2">
          <div className="text-center">
            <p className="font-medium">{user.name}</p>
            <p className="text-[var(--text-tertiary)] text-[10px] mt-0.5">{user.email}</p>
            {role && (
              <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                role === 'owner'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
              }`}>
                {role === 'owner' ? <Crown className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                {role === 'owner' ? '所有者' : '成员'}
              </div>
            )}
            {showOnlineStatus && (
              <div className="mt-1 flex items-center justify-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {isOnline ? '在线' : '离线'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return avatarContent
}

// Avatar Group Component for showing multiple members
interface AvatarGroupProps {
  users: Array<Pick<UserType, 'id' | 'name' | 'email'>>
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showOnlineStatus?: boolean
}

export function AvatarGroup({ users, max = 5, size = 'sm', showOnlineStatus = false }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max)
  const remainingCount = users.length - max

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div key={user.id} className="relative" style={{ zIndex: visibleUsers.length - index }}>
            <MemberAvatar
              user={user}
              size={size}
              showOnlineStatus={showOnlineStatus}
              showTooltip={false}
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={`avatar ${size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-2 border-white dark:border-[var(--bg-primary)]`}
            title={`还有 ${remainingCount} 位成员`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      {users.length > 0 && (
        <span className="ml-3 text-sm text-[var(--text-tertiary)]">
          {users.length} 位成员
        </span>
      )}
    </div>
  )
}
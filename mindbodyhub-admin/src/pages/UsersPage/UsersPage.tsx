import { useEffect, useState, type FormEvent } from 'react';
import { usersApi } from '@/api/users';
import { useAuth } from '@/context/AuthContext';
import type { AdminUpdateUserPayload, User } from '@/types/user';
import { UserRole, UserTariff } from '@/types/user';
import styles from './UsersPage.module.scss';

type DrawerMode = 'view' | 'edit' | null;

const roleLabels: Record<UserRole, string> = {
  admin: 'Админ',
  user: 'Пользователь',
};

const tariffLabels: Record<UserTariff, string> = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium',
};

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ru-RU');
}

function getDisplayName(user: User) {
  return (
    user.name?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.phone
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}

function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mode, setMode] = useState<DrawerMode>(null);
  const [form, setForm] = useState<AdminUpdateUserPayload>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setListError('');
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch {
      setListError('Не удалось загрузить список пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const openDrawer = (user: User, nextMode: 'view' | 'edit') => {
    setSelectedUser(user);
    setMode(nextMode);
    setSaveError('');
    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.role,
      tariff: user.tariff ?? UserTariff.FREE,
      isActive: user.isActive ?? true,
      avatarUrl: user.avatarUrl ?? '',
    });
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    setMode(null);
    setSaveError('');
  };

  const updateUserInList = (updated: User) => {
    setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedUser((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) return;

    setIsSaving(true);
    setSaveError('');

    try {
      const payload: AdminUpdateUserPayload = {
        firstName: form.firstName?.toString().trim() || null,
        lastName: form.lastName?.toString().trim() || null,
        role: form.role,
        tariff: form.tariff,
        isActive: form.isActive,
        avatarUrl: form.avatarUrl?.toString().trim() || null,
      };

      const updated = await usersApi.update(selectedUser.id, payload);
      updateUserInList(updated);
      setMode('view');
    } catch (error) {
      setSaveError(getErrorMessage(error, 'Не удалось сохранить изменения'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBlock = async (user: User) => {
    if (currentUser?.id === user.id) {
      window.alert('Нельзя заблокировать свой аккаунт');
      return;
    }

    const isBlocked = user.isActive === false;
    const confirmed = window.confirm(
      isBlocked
        ? `Разблокировать пользователя ${getDisplayName(user)}?`
        : `Заблокировать пользователя ${getDisplayName(user)}? Он не сможет войти в систему.`,
    );

    if (!confirmed) return;

    setActionId(user.id);
    setListError('');

    try {
      const updated = isBlocked
        ? await usersApi.unblock(user.id)
        : await usersApi.block(user.id);
      updateUserInList(updated);
    } catch (error) {
      setListError(
        getErrorMessage(
          error,
          isBlocked ? 'Не удалось разблокировать' : 'Не удалось заблокировать',
        ),
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (currentUser?.id === user.id) {
      window.alert('Нельзя удалить свой аккаунт');
      return;
    }

    const confirmed = window.confirm(
      `Удалить пользователя ${getDisplayName(user)}?\nЭто действие нельзя отменить.`,
    );

    if (!confirmed) return;

    setActionId(user.id);
    setListError('');

    try {
      await usersApi.remove(user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      if (selectedUser?.id === user.id) {
        closeDrawer();
      }
    } catch (error) {
      setListError(getErrorMessage(error, 'Не удалось удалить пользователя'));
    } finally {
      setActionId(null);
    }
  };

  const renderRowActions = (user: User) => {
    const isSelf = currentUser?.id === user.id;
    const isBusy = actionId === user.id;
    const isBlocked = user.isActive === false;

    return (
      <div className={styles.usersPage__actions}>
        <button
          type="button"
          className={styles.usersPage__actionBtn}
          onClick={() => openDrawer(user, 'view')}
        >
          Просмотр
        </button>
        <button
          type="button"
          className={`${styles.usersPage__actionBtn} ${styles.usersPage__actionBtn_primary}`}
          onClick={() => openDrawer(user, 'edit')}
        >
          Редактировать
        </button>
        <button
          type="button"
          className={`${styles.usersPage__actionBtn} ${styles.usersPage__actionBtn_warning}`}
          onClick={() => void handleToggleBlock(user)}
          disabled={isSelf || isBusy}
        >
          {isBusy ? '...' : isBlocked ? 'Разблокировать' : 'Заблокировать'}
        </button>
        <button
          type="button"
          className={`${styles.usersPage__actionBtn} ${styles.usersPage__actionBtn_danger}`}
          onClick={() => void handleDelete(user)}
          disabled={isSelf || isBusy}
        >
          {isBusy ? '...' : 'Удалить'}
        </button>
      </div>
    );
  };

  return (
    <section className={styles.usersPage}>
      <header className={styles.usersPage__header}>
        <div>
          <h1 className={styles.usersPage__title}>Пользователи</h1>
          <p className={styles.usersPage__subtitle}>
            {isLoading ? 'Загрузка...' : `${users.length} пользователей`}
          </p>
        </div>
      </header>

      {listError ? <p className={styles.usersPage__error}>{listError}</p> : null}

      <div className={styles.usersPage__tableCard}>
        <table className={styles.usersPage__table}>
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Телефон</th>
              <th>Роль</th>
              <th>Тариф</th>
              <th>Статус</th>
              <th>Создан</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && users.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.usersPage__empty}>
                  Пользователей пока нет
                </td>
              </tr>
            ) : null}

            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.usersPage__userCell}>
                    <div className={styles.usersPage__avatar}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={getDisplayName(user)} />
                      ) : (
                        <span />
                      )}
                    </div>
                    <span>{getDisplayName(user)}</span>
                  </div>
                </td>
                <td>{user.phone}</td>
                <td>
                  <span
                    className={`${styles.usersPage__badge} ${
                      user.role === UserRole.ADMIN
                        ? styles.usersPage__badge_admin
                        : styles.usersPage__badge_user
                    }`}
                  >
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td>{tariffLabels[user.tariff ?? UserTariff.FREE]}</td>
                <td>
                  <span
                    className={`${styles.usersPage__badge} ${
                      user.isActive === false
                        ? styles.usersPage__badge_inactive
                        : styles.usersPage__badge_active
                    }`}
                  >
                    {user.isActive === false ? 'Неактивен' : 'Активен'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{renderRowActions(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && mode ? (
        <>
          <button
            type="button"
            className={styles.usersPage__overlay}
            aria-label="Закрыть"
            onClick={closeDrawer}
          />
          <aside className={styles.usersPage__drawer}>
            <div className={styles.usersPage__drawerHeader}>
              <h2 className={styles.usersPage__drawerTitle}>
                {mode === 'view' ? 'Просмотр пользователя' : 'Редактирование'}
              </h2>
              <button
                type="button"
                className={styles.usersPage__close}
                onClick={closeDrawer}
              >
                ×
              </button>
            </div>

            <div className={styles.usersPage__drawerBody}>
              <div className={styles.usersPage__drawerAvatar}>
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={getDisplayName(selectedUser)} />
                ) : (
                  <span />
                )}
              </div>

              {mode === 'view' ? (
                <div className={styles.usersPage__fields}>
                  <div className={styles.usersPage__field}>
                    <span className={styles.usersPage__fieldLabel}>Имя</span>
                    <p className={styles.usersPage__fieldValue}>
                      {selectedUser.firstName || '—'}
                    </p>
                  </div>
                  <div className={styles.usersPage__field}>
                    <span className={styles.usersPage__fieldLabel}>Фамилия</span>
                    <p className={styles.usersPage__fieldValue}>
                      {selectedUser.lastName || '—'}
                    </p>
                  </div>
                  <div className={styles.usersPage__field}>
                    <span className={styles.usersPage__fieldLabel}>Телефон</span>
                    <p className={styles.usersPage__fieldValue}>{selectedUser.phone}</p>
                  </div>
                  <div className={styles.usersPage__field}>
                    <span className={styles.usersPage__fieldLabel}>Роль</span>
                    <p className={styles.usersPage__fieldValue}>
                      {roleLabels[selectedUser.role]}
                    </p>
                  </div>
                  <div className={styles.usersPage__field}>
                    <span className={styles.usersPage__fieldLabel}>Тариф</span>
                    <p className={styles.usersPage__fieldValue}>
                      {tariffLabels[selectedUser.tariff ?? UserTariff.FREE]}
                    </p>
                  </div>
                  <div className={styles.usersPage__field}>
                    <span className={styles.usersPage__fieldLabel}>Статус</span>
                    <p className={styles.usersPage__fieldValue}>
                      {selectedUser.isActive === false ? 'Неактивен' : 'Активен'}
                    </p>
                  </div>
                  <div className={styles.usersPage__field}>
                    <span className={styles.usersPage__fieldLabel}>Создан</span>
                    <p className={styles.usersPage__fieldValue}>
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <form className={styles.usersPage__form} onSubmit={(e) => void handleSave(e)}>
                  <label className={styles.usersPage__fieldLabel} htmlFor="firstName">
                    Имя
                  </label>
                  <input
                    id="firstName"
                    className={styles.usersPage__input}
                    value={form.firstName?.toString() ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  />

                  <label className={styles.usersPage__fieldLabel} htmlFor="lastName">
                    Фамилия
                  </label>
                  <input
                    id="lastName"
                    className={styles.usersPage__input}
                    value={form.lastName?.toString() ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  />

                  <label className={styles.usersPage__fieldLabel} htmlFor="role">
                    Роль
                  </label>
                  <select
                    id="role"
                    className={styles.usersPage__input}
                    value={form.role}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))
                    }
                  >
                    <option value={UserRole.USER}>Пользователь</option>
                    <option value={UserRole.ADMIN}>Админ</option>
                  </select>

                  <label className={styles.usersPage__fieldLabel} htmlFor="tariff">
                    Тариф
                  </label>
                  <select
                    id="tariff"
                    className={styles.usersPage__input}
                    value={form.tariff}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tariff: e.target.value as UserTariff }))
                    }
                  >
                    <option value={UserTariff.FREE}>Free</option>
                    <option value={UserTariff.BASIC}>Basic</option>
                    <option value={UserTariff.PREMIUM}>Premium</option>
                  </select>

                  <label className={styles.usersPage__checkbox}>
                    <input
                      type="checkbox"
                      checked={form.isActive ?? true}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                    />
                    Активен
                  </label>

                  <label className={styles.usersPage__fieldLabel} htmlFor="avatarUrl">
                    URL аватара
                  </label>
                  <input
                    id="avatarUrl"
                    className={styles.usersPage__input}
                    value={form.avatarUrl?.toString() ?? ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="https://..."
                  />

                  {saveError ? <p className={styles.usersPage__error}>{saveError}</p> : null}

                  <div className={styles.usersPage__formActions}>
                    <button
                      type="button"
                      className={styles.usersPage__actionBtn}
                      onClick={() => setMode('view')}
                      disabled={isSaving}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className={`${styles.usersPage__actionBtn} ${styles.usersPage__actionBtn_primary}`}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {mode === 'view' ? (
              <div className={styles.usersPage__drawerFooter}>
                <button
                  type="button"
                  className={`${styles.usersPage__actionBtn} ${styles.usersPage__actionBtn_warning}`}
                  onClick={() => void handleToggleBlock(selectedUser)}
                  disabled={
                    currentUser?.id === selectedUser.id || actionId === selectedUser.id
                  }
                >
                  {selectedUser.isActive === false ? 'Разблокировать' : 'Заблокировать'}
                </button>
                <button
                  type="button"
                  className={`${styles.usersPage__actionBtn} ${styles.usersPage__actionBtn_danger}`}
                  onClick={() => void handleDelete(selectedUser)}
                  disabled={
                    currentUser?.id === selectedUser.id || actionId === selectedUser.id
                  }
                >
                  Удалить
                </button>
                <button
                  type="button"
                  className={`${styles.usersPage__actionBtn} ${styles.usersPage__actionBtn_primary}`}
                  onClick={() => setMode('edit')}
                >
                  Редактировать
                </button>
              </div>
            ) : null}
          </aside>
        </>
      ) : null}
    </section>
  );
}

export default UsersPage;

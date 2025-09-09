import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convertir datos de la base de datos al formato de la aplicación
  const transformFromDB = (dbUser: any): User => ({
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role,
    isActive: dbUser.is_active,
    createdAt: dbUser.created_at,
  });

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedUsers = data?.map(transformFromDB) || [];
      setUsers(transformedUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Agregar usuario
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      // Primero crear el usuario en auth.users (esto sería ideal con una función de servidor)
      // Por ahora, generamos un UUID temporal
      const tempId = crypto.randomUUID();

      const dbUser = {
        id: tempId,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        is_active: userData.isActive,
      };

      const { data, error } = await supabase
        .from('users')
        .insert([dbUser])
        .select()
        .single();

      if (error) throw error;

      const newUser = transformFromDB(data);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      console.error('Error adding user:', err);
      throw new Error('Error al agregar usuario');
    }
  };

  // Actualizar usuario
  const updateUser = async (user: User) => {
    try {
      const dbUser = {
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.isActive,
      };

      const { data, error } = await supabase
        .from('users')
        .update(dbUser)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser = transformFromDB(data);
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      throw new Error('Error al actualizar usuario');
    }
  };

  // Eliminar usuario
  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw new Error('Error al eliminar usuario');
    }
  };

  // Buscar usuario por username
  const findUserByUsername = async (username: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return transformFromDB(data);
    } catch (err) {
      console.error('Error finding user by username:', err);
      return null;
    }
  };

  // Efecto para carga inicial
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    findUserByUsername,
    refetch: fetchUsers,
  };
}
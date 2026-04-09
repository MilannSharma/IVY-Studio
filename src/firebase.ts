
// In-memory store for Demo Mode
const store: Record<string, Record<string, any>> = {
    clients: {},
    projects: {},
    notes: {},
    transactions: {},
    print_orders: {},
    tasks: {},
    team: {},
    complaints: {},
    documents: {}
};

const listeners: Record<string, Set<(snapshot: any) => void>> = {};

const triggerListeners = (path: string) => {
    if (listeners[path]) {
        const docs = Object.values(store[path] || {}).sort((a: any, b: any) => {
            const timeA = a.createdAt?.toMillis?.() || a.createdAt?.getTime?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || b.createdAt?.getTime?.() || 0;
            return (timeB as number) - (timeA as number);
        });
        
        const snapshot = {
            docs: docs.map(data => ({
                id: data.id,
                data: () => data
            })),
            forEach: (cb: any) => docs.forEach(data => cb({ id: data.id, data: () => data })),
            empty: docs.length === 0,
            size: docs.length
        };
        
        listeners[path].forEach(cb => cb(snapshot));
    }
};

export const db = {};
export const auth = {
    currentUser: {
        uid: 'demo-user',
        email: 'demo@ivy.studio',
        displayName: 'Demo User',
        photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0e30f1&color=fff',
        role: 'vendor'
    }
};
export const storage = {};

export const Timestamp = {
    now: () => {
        const d = new Date();
        return {
            toDate: () => d,
            toMillis: () => d.getTime(),
            seconds: Math.floor(d.getTime() / 1000),
            nanoseconds: (d.getTime() % 1000) * 1e6
        };
    },
    fromDate: (date: Date) => ({
        toDate: () => date,
        toMillis: () => date.getTime(),
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1e6
    }),
};

export const collection = (db: any, path: string, ...args: any[]) => path;
export const doc = (refOrDb: any, pathOrId?: string, id?: string) => {
    const docId = id || (typeof pathOrId === 'string' && !pathOrId.includes('/') ? pathOrId : Math.random().toString(36).substr(2, 9));
    const path = typeof refOrDb === 'string' ? refOrDb : (typeof pathOrId === 'string' && pathOrId.includes('/') ? pathOrId.split('/')[0] : 'mock-path');
    return { id: docId, path: `${path}/${docId}`, collectionPath: path };
};
export const query = (ref: any, ...args: any[]) => ref;
export const where = (field: string, op: string, value: any) => ({ field, op, value });
export const orderBy = (field: string, direction: string) => ({ field, direction });
export const limit = (n: number) => ({ limit: n });

export const onSnapshot = (path: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void) => {
    const collectionPath = typeof path === 'string' ? path : path.collectionPath;
    if (!listeners[collectionPath]) listeners[collectionPath] = new Set();
    listeners[collectionPath].add(callback);
    
    // Initial trigger
    triggerListeners(collectionPath);
    
    return () => {
        listeners[collectionPath].delete(callback);
    };
};

export const addDoc = async (path: any, data: any) => {
    const collectionPath = typeof path === 'string' ? path : path.collectionPath;
    const id = Math.random().toString(36).substr(2, 9);
    if (!store[collectionPath]) store[collectionPath] = {};
    store[collectionPath][id] = { ...data, id };
    triggerListeners(collectionPath);
    return { id };
};

export const updateDoc = async (ref: any, data: any) => {
    const { id, collectionPath } = ref;
    if (store[collectionPath] && store[collectionPath][id]) {
        store[collectionPath][id] = { ...store[collectionPath][id], ...data };
        triggerListeners(collectionPath);
    }
};

export const deleteDoc = async (ref: any) => {
    const { id, collectionPath } = ref;
    if (store[collectionPath]) {
        delete store[collectionPath][id];
        triggerListeners(collectionPath);
    }
};

export const setDoc = async (ref: any, data: any, options?: any) => {
    const { id, collectionPath } = ref;
    if (!store[collectionPath]) store[collectionPath] = {};
    if (options?.merge && store[collectionPath][id]) {
        store[collectionPath][id] = { ...store[collectionPath][id], ...data };
    } else {
        store[collectionPath][id] = { ...data, id };
    }
    triggerListeners(collectionPath);
};

export const getDocs = async (path: any) => {
    const collectionPath = typeof path === 'string' ? path : path.collectionPath;
    const docs = Object.values(store[collectionPath] || {});
    return { 
        docs: docs.map(data => ({ id: data.id, data: () => data })),
        forEach: (cb: any) => docs.forEach(data => cb({ id: data.id, data: () => data })),
        empty: docs.length === 0,
        size: docs.length
    };
};

export const getDoc = async (ref: any) => {
    const { id, collectionPath } = ref;
    const data = store[collectionPath]?.[id];
    return { 
        exists: () => !!data, 
        data: () => data || null 
    };
};

// Storage Mocks
export const ref = (storage: any, path: string) => ({ fullPath: path, ref: { fullPath: path } });
export const uploadBytes = async (ref: any, file: File) => ({ ref: { fullPath: ref.fullPath } });
export const getDownloadURL = async (ref: any) => 'https://picsum.photos/seed/demo/800/600';
export const deleteObject = async (ref: any) => {};

export const handleFirestoreError = (error: any, type: string, path: string, ...args: any[]) => {
    console.error(`Mock Firestore Error [${type}] at ${path}:`, error);
};

export enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
}

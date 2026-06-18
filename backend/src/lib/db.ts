import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

function findServiceAccount(): string | null {
  // 1. FIREBASE_SERVICE_ACCOUNT env var (highest priority)
  if (process.env.FIREBACK_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBACK_SERVICE_ACCOUNT;
    return raw!;
  }

  // 2. Search multiple possible paths for service-account.json
  const candidates = [
    path.join(process.cwd(), 'service-account.json'),
    path.join(process.cwd(), 'backend', 'service-account.json'),
    path.join(__dirname, '..', '..', '..', 'service-account.json'),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8');
    }
  }

  return null;
}

const PROJECT_ID = 'edworld-career-os-2026';

if (getApps().length === 0) {
  const raw = findServiceAccount();

  if (raw) {
    try {
      const serviceAccount = JSON.parse(raw);
      console.log(`Firebase Admin SDK: initialized with credential for ${serviceAccount.client_email || serviceAccount.project_id}`);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || PROJECT_ID
      });
    } catch (err: any) {
      console.error('Failed to parse service account credentials:', err.message);
      console.log('Falling back to project-only initialization (limited functionality)');
      initializeApp({ projectId: PROJECT_ID });
    }
  } else {
    console.warn('No service account found. Firebase Auth verification will fail.');
    console.warn('Set FIREBASE_SERVICE_ACCOUNT env var or place service-account.json in the project root.');
    initializeApp({ projectId: PROJECT_ID });
  }
}

export const firestoreDb = getFirestore();
firestoreDb.settings({ ignoreUndefinedProperties: true });
export const firebaseAuth = getAuth();

// Helper to filter documents in memory, supporting Prisma-like WHERE clauses
function matchFilter(doc: any, where: any): boolean {
  if (!where) return true;

  if (where.OR) {
    return where.OR.some((sub: any) => matchFilter(doc, sub));
  }
  if (where.AND) {
    return where.AND.every((sub: any) => matchFilter(doc, sub));
  }
  if (where.NOT) {
    return !matchFilter(doc, where.NOT);
  }

  for (const key of Object.keys(where)) {
    const val = where[key];
    if (val === undefined) continue;

    const docVal = doc[key];

    if (typeof val === 'object' && val !== null) {
      if ('in' in val) {
        if (!Array.isArray(val.in) || !val.in.includes(docVal)) return false;
      }
      else if ('contains' in val) {
        if (typeof docVal !== 'string' || !docVal.toLowerCase().includes(val.contains.toLowerCase())) return false;
      }
      else if ('not' in val) {
        if (docVal === val.not) return false;
      }
      else if ('gte' in val) {
        if (docVal < val.gte) return false;
      }
      else if ('lte' in val) {
        if (docVal > val.lte) return false;
      }
      else if ('gt' in val) {
        if (docVal <= val.gt) return false;
      }
      else if ('lt' in val) {
        if (docVal >= val.lt) return false;
      }
    } else {
      if (docVal !== val) return false;
    }
  }
  return true;
}

// Helper to resolve nested relations dynamically
async function resolveRelations(collectionName: string, doc: any, include: any): Promise<any> {
  if (!doc) return doc;
  const result = { ...doc };
  if (!include) return result;

  for (const relation of Object.keys(include)) {
    if (!include[relation]) continue;

    const relInclude = typeof include[relation] === 'object' ? include[relation].include : undefined;

    if (collectionName === 'users') {
      if (relation === 'profile') {
        const snap = await firestoreDb.collection('profiles').where('userId', '==', doc.id).limit(1).get();
        if (!snap.empty) {
          const p = { id: snap.docs[0].id, ...snap.docs[0].data() };
          result.profile = await resolveRelations('profiles', p, relInclude);
        } else {
          result.profile = null;
        }
      }
      else if (relation === 'resumes') {
        const snap = await firestoreDb.collection('resumes').where('userId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.resumes = await Promise.all(list.map(async item => {
          return await resolveRelations('resumes', item, relInclude);
        }));
      }
      else if (relation === 'applications') {
        const snap = await firestoreDb.collection('applications').where('userId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.applications = await Promise.all(list.map(async item => {
          return await resolveRelations('applications', item, relInclude);
        }));
      }
      else if (relation === 'connections') {
        const snapSender = await firestoreDb.collection('connections').where('senderId', '==', doc.id).get();
        const snapReceiver = await firestoreDb.collection('connections').where('receiverId', '==', doc.id).get();
        const listSender = snapSender.docs.map(d => ({ id: d.id, ...d.data() }));
        const listReceiver = snapReceiver.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Merge and deduplicate
        const seen = new Set();
        let list: any[] = [];
        for (const item of [...listSender, ...listReceiver]) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            list.push(item);
          }
        }
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.connections = await Promise.all(list.map(async item => {
          return await resolveRelations('connections', item, relInclude);
        }));
      }
      else if (relation === 'connectedTo') {
        const snap = await firestoreDb.collection('connections').where('receiverId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.connectedTo = await Promise.all(list.map(async item => {
          return await resolveRelations('connections', item, relInclude);
        }));
      }
      else if (relation === 'sentMessages') {
        const snap = await firestoreDb.collection('messages').where('senderId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.sentMessages = await Promise.all(list.map(async item => {
          return await resolveRelations('messages', item, relInclude);
        }));
      }
      else if (relation === 'recvMessages') {
        const snap = await firestoreDb.collection('messages').where('receiverId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.recvMessages = await Promise.all(list.map(async item => {
          return await resolveRelations('messages', item, relInclude);
        }));
      }
      else if (relation === 'posts') {
        const snap = await firestoreDb.collection('posts').where('userId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.posts = await Promise.all(list.map(async item => {
          return await resolveRelations('posts', item, relInclude);
        }));
      }
      else if (relation === 'comments') {
        const snap = await firestoreDb.collection('comments').where('userId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.comments = await Promise.all(list.map(async item => {
          return await resolveRelations('comments', item, relInclude);
        }));
      }
      else if (relation === 'chats') {
        const snap = await firestoreDb.collection('aiChats').where('userId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.chats = await Promise.all(list.map(async item => {
          return await resolveRelations('aiChats', item, relInclude);
        }));
      }
      else if (relation === 'notifications') {
        const snap = await firestoreDb.collection('notifications').where('userId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.notifications = await Promise.all(list.map(async item => {
          return await resolveRelations('notifications', item, relInclude);
        }));
      }
      else if (relation === 'pointTransactions') {
        const snap = await firestoreDb.collection('pointTransactions').where('userId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.pointTransactions = await Promise.all(list.map(async item => {
          return await resolveRelations('pointTransactions', item, relInclude);
        }));
      }
      else if (relation === 'ambassadorApplications') {
        const snap = await firestoreDb.collection('ambassadorApplications').where('userId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.ambassadorApplications = await Promise.all(list.map(async item => {
          return await resolveRelations('ambassadorApplications', item, relInclude);
        }));
      }
    }
    else if (collectionName === 'profiles') {
      if (relation === 'skills') {
        const snap = await firestoreDb.collection('skills').where('profileId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        result.skills = await Promise.all(list.map(async item => {
          return await resolveRelations('skills', item, relInclude);
        }));
      }
      else if (relation === 'projects') {
        const snap = await firestoreDb.collection('projects').where('profileId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        result.projects = await Promise.all(list.map(async item => {
          return await resolveRelations('projects', item, relInclude);
        }));
      }
      else if (relation === 'experience') {
        const snap = await firestoreDb.collection('experiences').where('profileId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        result.experience = await Promise.all(list.map(async item => {
          return await resolveRelations('experiences', item, relInclude);
        }));
      }
      else if (relation === 'certifications') {
        const snap = await firestoreDb.collection('certifications').where('profileId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        result.certifications = await Promise.all(list.map(async item => {
          return await resolveRelations('certifications', item, relInclude);
        }));
      }
      else if (relation === 'user') {
        const userDoc = await firestoreDb.collection('users').doc(doc.userId).get();
        result.user = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
    }
    else if (collectionName === 'posts') {
      if (relation === 'user') {
        const userDoc = await firestoreDb.collection('users').doc(doc.userId).get();
        result.user = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
      else if (relation === 'comments') {
        const snap = await firestoreDb.collection('comments').where('postId', '==', doc.id).get();
        let comments = await Promise.all(snap.docs.map(async d => {
          const comment = { id: d.id, ...d.data() };
          return await resolveRelations('comments', comment, relInclude);
        }));
        
        comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        result.comments = comments;
      }
    }
    else if (collectionName === 'comments') {
      if (relation === 'user') {
        const userDoc = await firestoreDb.collection('users').doc(doc.userId).get();
        result.user = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
    }
    else if (collectionName === 'applications') {
      if (relation === 'opportunity') {
        const opDoc = await firestoreDb.collection('opportunities').doc(doc.opportunityId).get();
        result.opportunity = opDoc.exists ? await resolveRelations('opportunities', { id: opDoc.id, ...opDoc.data() }, relInclude) : null;
      }
      else if (relation === 'user') {
        const userDoc = await firestoreDb.collection('users').doc(doc.userId).get();
        result.user = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
    }
    else if (collectionName === 'connections') {
      if (relation === 'sender') {
        const userDoc = await firestoreDb.collection('users').doc(doc.senderId).get();
        result.sender = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
      else if (relation === 'receiver') {
        const userDoc = await firestoreDb.collection('users').doc(doc.receiverId).get();
        result.receiver = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
    }
    else if (collectionName === 'messages') {
      if (relation === 'sender') {
        const userDoc = await firestoreDb.collection('users').doc(doc.senderId).get();
        result.sender = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
      else if (relation === 'receiver') {
        const userDoc = await firestoreDb.collection('users').doc(doc.receiverId).get();
        result.receiver = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
    }
    else if (collectionName === 'resumes') {
      if (relation === 'user') {
        const userDoc = await firestoreDb.collection('users').doc(doc.userId).get();
        result.user = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
    }
    else if (collectionName === 'projects' || collectionName === 'experiences' || collectionName === 'certifications' || collectionName === 'skills') {
      if (relation === 'profile') {
        const snap = await firestoreDb.collection('profiles').doc(doc.profileId).get();
        result.profile = snap.exists ? await resolveRelations('profiles', { id: snap.id, ...snap.data() }, relInclude) : null;
      }
    }
    else if (collectionName === 'opportunities') {
      if (relation === 'applications') {
        const snap = await firestoreDb.collection('applications').where('opportunityId', '==', doc.id).get();
        let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const relArgs = include[relation];
        if (relArgs && typeof relArgs === 'object' && relArgs.where) {
          list = list.filter(item => matchFilter(item, relArgs.where));
        }
        result.applications = await Promise.all(list.map(async item => {
          return await resolveRelations('applications', item, relInclude);
        }));
      }
    }
    else if (collectionName === 'pointTransactions') {
      if (relation === 'user') {
        const userDoc = await firestoreDb.collection('users').doc(doc.userId).get();
        result.user = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
    }
    else if (collectionName === 'aiChats' || collectionName === 'ambassadorApplications') {
      if (relation === 'user') {
        const userDoc = await firestoreDb.collection('users').doc(doc.userId).get();
        result.user = userDoc.exists ? await resolveRelations('users', { id: userDoc.id, ...userDoc.data() }, relInclude) : null;
      }
    }
  }

  return result;
}

// Individual Collection Client mapping Prisma methods to Firestore
class CollectionClient {
  constructor(private collectionName: string) {}

  async findUnique(args: any) {
    return this.findFirst(args);
  }

  async findFirst(args: any) {
    const where = args?.where || {};
    
    // Performance optimization: if checking by direct ID, load it instantly
    if (where.id && typeof where.id === 'string') {
      const doc = await firestoreDb.collection(this.collectionName).doc(where.id).get();
      if (!doc.exists) return null;
      return await resolveRelations(this.collectionName, { id: doc.id, ...doc.data() }, args?.include);
    }

    let query: any = firestoreDb.collection(this.collectionName);
    
    // Compile simple equality constraints for Firestore native filtering
    for (const key of Object.keys(where)) {
      const val = where[key];
      if (val === undefined) continue;
      
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        query = query.where(key, '==', val);
      } else if (val === null) {
        query = query.where(key, '==', null);
      }
    }

    const snapshot = await query.get();
    let list = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    if (args?.where) {
      list = list.filter(doc => matchFilter(doc, args.where));
    }

    if (list.length === 0) return null;
    return await resolveRelations(this.collectionName, list[0], args?.include);
  }

  async findMany(args: any) {
    const where = args?.where || {};
    let query: any = firestoreDb.collection(this.collectionName);
    
    // Compile simple equality constraints for Firestore native filtering
    for (const key of Object.keys(where)) {
      const val = where[key];
      if (val === undefined) continue;
      
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        query = query.where(key, '==', val);
      } else if (val === null) {
        query = query.where(key, '==', null);
      }
    }

    const snapshot = await query.get();
    let list = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    if (args?.where) {
      list = list.filter(doc => matchFilter(doc, args.where));
    }

    if (args?.orderBy) {
      const orderBys = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
      list.sort((a, b) => {
        for (const order of orderBys) {
          const field = Object.keys(order)[0];
          const dir = order[field];
          const aVal = a[field];
          const bVal = b[field];
          if (aVal !== bVal) {
            if (dir === 'desc') {
              return aVal > bVal ? -1 : 1;
            } else {
              return aVal < bVal ? -1 : 1;
            }
          }
        }
        return 0;
      });
    }

    if (args?.take !== undefined) {
      list = list.slice(0, args.take);
    }

    return await Promise.all(list.map(doc => resolveRelations(this.collectionName, doc, args?.include)));
  }

  async create(args: any) {
    const data = { ...args.data };
    const now = new Date().toISOString();
    data.createdAt = data.createdAt || now;
    data.updatedAt = data.updatedAt || now;

    let docId = data.id || undefined;
    if (!docId) {
      docId = crypto.randomUUID();
    } else {
      delete data.id;
    }

    await firestoreDb.collection(this.collectionName).doc(docId).set(data);
    const created = { id: docId, ...data };
    return await resolveRelations(this.collectionName, created, args?.include);
  }

  async createMany(args: any) {
    const list = Array.isArray(args.data) ? args.data : [args.data];
    const batch = firestoreDb.batch();
    const createdList: any[] = [];

    for (const item of list) {
      const data = { ...item };
      const now = new Date().toISOString();
      data.createdAt = data.createdAt || now;
      data.updatedAt = data.updatedAt || now;
      
      const docId = data.id || crypto.randomUUID();
      if (data.id) delete data.id;

      const docRef = firestoreDb.collection(this.collectionName).doc(docId);
      batch.set(docRef, data);
      createdList.push({ id: docId, ...data });
    }

    await batch.commit();
    return { count: createdList.length };
  }

  async update(args: any) {
    const where = args.where || {};
    const data = { ...args.data };
    
    let docId = where.id;
    if (!docId) {
      const first = await this.findFirst({ where });
      if (!first) throw new Error(`Document not found for update in collection ${this.collectionName}`);
      docId = first.id;
    }

    const now = new Date().toISOString();
    data.updatedAt = now;

    // Remove nested Prisma relation structures and undefined properties from update payload
    for (const key of Object.keys(data)) {
      if (data[key] === undefined) {
        delete data[key];
      } else if (data[key] && typeof data[key] === 'object' && ('connect' in data[key] || 'disconnect' in data[key])) {
        delete data[key];
      }
    }

    await firestoreDb.collection(this.collectionName).doc(docId).update(data);
    
    const updatedDoc = await firestoreDb.collection(this.collectionName).doc(docId).get();
    const result = { id: docId, ...updatedDoc.data() };
    return await resolveRelations(this.collectionName, result, args?.include);
  }

  async delete(args: any) {
    const where = args.where || {};
    let docId = where.id;
    if (!docId) {
      const first = await this.findFirst({ where });
      if (!first) throw new Error(`Document not found for delete in collection ${this.collectionName}`);
      docId = first.id;
    }

    const docSnapshot = await firestoreDb.collection(this.collectionName).doc(docId).get();
    const docData = { id: docId, ...docSnapshot.data() };

    await firestoreDb.collection(this.collectionName).doc(docId).delete();
    return docData;
  }

  async deleteMany(args: any) {
    const where = args?.where || {};
    let query: any = firestoreDb.collection(this.collectionName);
    
    // Compile simple equality constraints for Firestore native filtering
    for (const key of Object.keys(where)) {
      const val = where[key];
      if (val === undefined) continue;
      
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        query = query.where(key, '==', val);
      } else if (val === null) {
        query = query.where(key, '==', null);
      }
    }

    const snapshot = await query.get();
    let list = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    if (args?.where) {
      list = list.filter(doc => matchFilter(doc, args.where));
    }

    const batch = firestoreDb.batch();
    for (const doc of list) {
      const docRef = firestoreDb.collection(this.collectionName).doc(doc.id);
      batch.delete(docRef);
    }
    await batch.commit();
    return { count: list.length };
  }

  async count(args?: any) {
    const list = await this.findMany({ where: args?.where });
    return list.length;
  }

  async upsert(args: any) {
    const where = args.where || {};
    const first = await this.findFirst({ where });
    if (first) {
      return await this.update({ where: { id: first.id }, data: args.update });
    } else {
      return await this.create({ data: args.create });
    }
  }
}

// Prisma compatibility class matching standard API properties
class PrismaFirestoreClient {
  _db = firestoreDb;
  user = new CollectionClient('users');
  profile = new CollectionClient('profiles');
  resume = new CollectionClient('resumes');
  project = new CollectionClient('projects');
  experience = new CollectionClient('experiences');
  certification = new CollectionClient('certifications');
  skill = new CollectionClient('skills');
  opportunity = new CollectionClient('opportunities');
  application = new CollectionClient('applications');
  connection = new CollectionClient('connections');
  message = new CollectionClient('messages');
  notification = new CollectionClient('notifications');
  course = new CollectionClient('courses');
  post = new CollectionClient('posts');
  comment = new CollectionClient('comments');
  aIChat = new CollectionClient('aiChats');
  dataLog = new CollectionClient('dataLogs');
  passwordResetOTP = new CollectionClient('passwordResetOTPs');
  pointTransaction = new CollectionClient('pointTransactions');
  ambassadorApplication = new CollectionClient('ambassadorApplications');
  ad = new CollectionClient('ads');

  async $transaction(fn: (tx: any) => Promise<any>) {
    return await fn(this);
  }
}

export const prisma = new PrismaFirestoreClient();

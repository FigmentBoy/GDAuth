import * as Realm from 'realm-web';
import { Buffer } from 'buffer';

export interface Env {
	mongodb_appid: string;
	mongodb_token: string;
}

type Document = globalThis.Realm.Services.MongoDB.Document;

// Declare the interface for a "todos" document
interface Session extends Document {
	sessionID: string,
	accountID: number;
    username: string;
    expires_after: Date;
}

let App: Realm.App;
const ObjectId = Realm.BSON.ObjectID;

function uuidv4(): string {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
	  	(+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
	);
}  

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const uri = url.pathname;

		const path: string[] = uri.split('/');
		path.shift();

		if (path[path.length - 1] == "") {
			path.pop();
		}

		if (path.length > 2) {
			return new Response("-1");
		}

		if (path[0] != "authentication") {
			return new Response("-1");
		}

		if (path[1] != "authenticate" && path[1] != "validate") {
			return new Response("-1");
		}

		let data;

		try {
			data = await request.formData();
		} catch (error) {
			return new Response("-1");
		}

		if (path[1] == "authenticate") {
			const accountid = data.get("accountid");
			const gjp = data.get("gjp");

			if (!accountid || !gjp) {
				return new Response("-1");
			}

			const headers: any = {
				"Content-Type": "application/x-www-form-urlencoded"
			}

			const reqData: any = {
				"targetAccountID": accountid,
				"accountID": accountid,
				"gjp2": gjp,
				"secret": "Wmfd2893gb7"
			}
		
			const res = await fetch("http://www.boomlings.com/database/getGJUserInfo20.php", {
				method: "POST",
				headers: headers,
				body: new URLSearchParams(reqData)
			}).then(response => response.text())

			if (res == "-1") {
				return new Response("-1");
			}

			const split = res.split(":");
			if (split[0] != "1") {
				return new Response("-1");
			}

			const username = split[1];
			const uuid = uuidv4();

			console.log(`Saving token ${uuid} for ${username}`)

			const session: Session = {
				_id: new ObjectId(),
				sessionID: uuid,
				accountID: parseInt(accountid as string),
				username: username,
				expires_after: new Date(new Date().setDate(new Date().getDate() + 1))
			}

			App = App || new Realm.App(env.mongodb_appid);
			const credentials = Realm.Credentials.apiKey(env.mongodb_token);
			const user = await App.logIn(credentials);
			const client = user.mongoClient('mongodb-atlas');
			const sessions = client.db("db").collection<Session>('sessions');

			await sessions.insertOne(session);

			return new Response(JSON.stringify(session));
		}
		
		if (path[1] == "validate") {
			const sessionID = data.get("sessionID");

			if (!sessionID) {
				return new Response("-1");
			}

			App = App || new Realm.App(env.mongodb_appid);
			const credentials = Realm.Credentials.apiKey(env.mongodb_token);
			const user = await App.logIn(credentials);
			const client = user.mongoClient('mongodb-atlas');
			const sessions = client.db("db").collection<Session>('sessions');

			const session = await sessions.findOne({"sessionID": sessionID});

			if (!session) {
				return new Response("-1");
			}

			return new Response(JSON.stringify(session));
		}

		return new Response("-1");
	},
} satisfies ExportedHandler<Env>;

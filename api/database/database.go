package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"sync"

	_ "github.com/libsql/libsql-client-go/libsql"
)

const (
	// Database migration queries
	createUsersTableQuery = "CREATE TABLE IF NOT EXISTS `users`" +
		"(`id` integer,`username` text UNIQUE,`email` text UNIQUE,`password` blob,`role` integer,PRIMARY KEY (`id`));"

	createTokensTableQuery = "CREATE TABLE IF NOT EXISTS `tokens`" +
		"(`id` integer,`token_value` text,`user_id` integer,`kind` integer," +
		"PRIMARY KEY (`id`)," +
		"CONSTRAINT `fk_users_tokens` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE);"

	createNotesTableQuery = "CREATE TABLE IF NOT EXISTS `notes`" +
		"(`id` integer,`content` text, `color` text, `user_id` integer, `room_id` integer, `created_at` timestamp, `last_edited_at` timestamp," +
		"PRIMARY KEY (`id`)," +
		"CONSTRAINT `fk_users_notes` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE," +
		"CONSTRAINT `fk_rooms_notes` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE);"

	createRoomsTableQuery = "CREATE TABLE IF NOT EXISTS `rooms`" +
		"(`id` integer,`name` text, `invite` text UNIQUE, `creator_id` integer," +
		"PRIMARY KEY (`id`)," +
		"CONSTRAINT `fk_room_user` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE);"

	createUsersRoomsTableQuery = "CREATE TABLE IF NOT EXISTS `users_rooms`" +
		"(`id` integer,`user_id` integer, `room_id` integer," +
		"PRIMARY KEY (`id`)," +
		"UNIQUE (user_id, room_id)," +
		"CONSTRAINT `fk_users_rooms` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE," +
		"CONSTRAINT `fk_rooms_users` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE);"

	//Database errors
	DB_Error_ConstraintFailed = "UNIQUE constraint failed"
)

type Database struct {
	db *sql.DB
}

func (database Database) GetDB() *sql.DB {
	return database.db
}

var databaseInstance *Database
var lock = &sync.Mutex{}

func GetInstance() *Database {
	lock.Lock()
	defer lock.Unlock()

	if databaseInstance == nil {
		db, dbErr := sql.Open("libsql", os.Getenv("PROD_DB_STRING"))
		if dbErr != nil {
			log.Fatal(dbErr.Error())
		}

		if connErr := db.Ping(); connErr != nil {
			log.Fatal(connErr)
		}

		fmt.Println("Connected to the database")
		databaseInstance = &Database{db}
		databaseInstance.Init()
	}
	return databaseInstance
}

func (database *Database) Init() {
	database.GetDB().Exec(createUsersTableQuery)
	database.GetDB().Exec(createTokensTableQuery)
	database.GetDB().Exec(createNotesTableQuery)
	database.GetDB().Exec(createRoomsTableQuery)
	database.GetDB().Exec(createUsersRoomsTableQuery)
}

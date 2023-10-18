package storage

import (
	"database/sql"
	"errors"
	"gocker-api/database"
	"gocker-api/models"
)

type UserStorage struct{}

const userTypeMismatchErr = "must be type user"

func (userStorage *UserStorage) Get(id int) (interface{}, error) {
	var user models.User
	database := database.GetInstance().GetDB()

	result := database.QueryRow("SELECT * FROM users where id = ? ;", id)

	if scanErr := result.Scan(&user.ID, &user.FirstName, &user.Email, &user.Password, &user.Role); scanErr != nil {

		if errors.Is(scanErr, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, scanErr
	}

	return &user, nil
}

func (userStorage *UserStorage) Create(item interface{}) error {
	user, ok := item.(*models.User)

	if !ok {
		return errors.New(userTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	_, err := database.Exec("INSERT INTO users (first_name, email, password, role) VALUES (?, ?, ?, ?);", user.FirstName, user.Email, user.Password, user.Role)

	return err
}

func (userStorage *UserStorage) Update(item interface{}) error {
	user, ok := item.(*models.User)

	if !ok {
		return errors.New(userTypeMismatchErr)
	}
	database := database.GetInstance().GetDB()
	result, err := database.Exec("UPDATE users SET first_name = ?, email = ?, password = ?, role = ? WHERE id = ? ;",
		user.FirstName, user.Email, user.Password, user.Role, user.ID)

	if err != nil {
		return err
	}

	if rowsAffected, _ := result.RowsAffected(); rowsAffected == 0 {
		return errors.New("user not found")
	}

	return nil
}

func (userStorage *UserStorage) Delete(item interface{}) error {
	user, ok := item.(*models.User)

	if !ok {
		return errors.New(userTypeMismatchErr)
	}

	database := database.GetInstance().GetDB()
	result, err := database.Exec("DELETE FROM users WHERE id = ? ;", user.ID)

	if err != nil {
		return err
	}

	if rowsAffected, _ := result.RowsAffected(); rowsAffected == 0 {
		return errors.New("user not found")
	}
	return nil
}

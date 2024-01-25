package models

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"errors"
	"io"
)

type UserRole int

const (
	Admin UserRole = iota + 1
	Standard
)

type User struct {
	ID       uint     `json:"id"`
	UserName string   `json:"username"`
	Email    string   `json:"email"`
	Password []byte   `json:"password"`
	Role     UserRole `json:"role"`
}

var key []byte = make([]byte, 32)

// Function that encodes user's password using AES encryption.
func (user *User) EncodePassword(password string) error {
	cipherBlock, cipherErr := aes.NewCipher(key)

	if cipherErr != nil {
		return cipherErr
	}

	gcm, gcmErr := cipher.NewGCM(cipherBlock)

	if gcmErr != nil {
		return gcmErr
	}

	nonce := make([]byte, gcm.NonceSize())

	if _, readErr := io.ReadFull(rand.Reader, nonce); readErr != nil {
		return readErr
	}

	user.Password = gcm.Seal(nonce, nonce, []byte(password), nil)

	return nil
}

// Function that decodes user's password using AES decryption and compares it to the input password.
func (user User) ComparePassword(password string) error {

	cipherBlock, cipherErr := aes.NewCipher(key)

	if cipherErr != nil {
		return cipherErr
	}

	gcm, gcmErr := cipher.NewGCM(cipherBlock)
	nonceSize := gcm.NonceSize()

	if gcmErr != nil || (len(user.Password) < nonceSize) {
		return gcmErr
	}

	nonce, cipherText := user.Password[:nonceSize], user.Password[nonceSize:]

	passwordText, decryptErr := gcm.Open(nil, []byte(nonce), []byte(cipherText), nil)

	if decryptErr != nil {
		return decryptErr
	}

	if string(passwordText) != password {
		return errors.New("wrong password. Please, try again")
	}

	return nil
}

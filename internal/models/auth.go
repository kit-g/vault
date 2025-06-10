package models

type UserIn struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Username string `json:"username" binding:"required,min=6"`
}

type UserOut struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
}

type Login struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginOut struct {
	Token string  `json:"token"`
	User  UserOut `json:"user"`
}

func NewUserOut(user User) UserOut {
	return UserOut{
		ID:       user.ID,
		Email:    user.Email,
		Username: user.Username,
	}
}

func NewLoginOut(token string, user User) LoginOut {
	return LoginOut{
		Token: token,
		User:  NewUserOut(user),
	}
}

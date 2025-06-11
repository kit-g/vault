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

type Session struct {
	Token   string `json:"token"`
	Refresh string `json:"refresh"`
}

type Login struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginOut struct {
	Session Session `json:"session"`
	User    UserOut `json:"user"`
}

func NewSession(token string, refresh string) Session {
	return Session{
		Token:   token,
		Refresh: refresh,
	}
}

func NewUserOut(user User) UserOut {
	return UserOut{
		ID:       user.ID,
		Email:    user.Email,
		Username: user.Username,
	}
}

func NewLoginOut(token string, refresh string, user User) LoginOut {
	return LoginOut{
		Session: NewSession(token, refresh),
		User:    NewUserOut(user),
	}
}

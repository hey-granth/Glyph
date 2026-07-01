package services

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// EventBus is responsible for type-safe event broadcasting.
type EventBus struct {
	ctx context.Context
}

func NewEventBus() *EventBus {
	return &EventBus{}
}

// Start binds the bus to the application context.
func (e *EventBus) Start(ctx context.Context) {
	e.ctx = ctx
}

// Emit broadcasts an event payload to the frontend.
func (e *EventBus) Emit(eventName string, payload any) {
	if e.ctx != nil {
		runtime.EventsEmit(e.ctx, eventName, payload)
	}
}

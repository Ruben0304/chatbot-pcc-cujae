
import { ChatRepository } from '@/repository/chatRepository'
import { FeedbackRepository } from '@/repository/feedbackRepository'

export const repositoryModules = {
    install: (app) => {
        // Repositories
        const chatRepository = new ChatRepository()
        const feedbackRepository = new FeedbackRepository()
        // Provide repositories
        app.provide('chatRepository', chatRepository)
        app.provide('feedbackRepository', feedbackRepository)
    }
}
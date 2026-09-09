package com.tecsup.Evaluacion.service;

import com.tecsup.Evaluacion.model.HospitalizationRequest;
import com.tecsup.Evaluacion.model.RequestStatus;
import com.tecsup.Evaluacion.repository.HospitalizationRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class HospitalizationRequestService {

    private final HospitalizationRequestRepository repository;

    public HospitalizationRequestService(HospitalizationRequestRepository repository) {
        this.repository = repository;
    }

    public HospitalizationRequest create(HospitalizationRequest request) {
        request.setRequestDate(LocalDateTime.now());
        request.setStatus(RequestStatus.PENDING);
        return repository.save(request);
    }
}
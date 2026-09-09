package com.tecsup.Evaluacion.controller;

import com.tecsup.Evaluacion.model.HospitalizationRequest;
import com.tecsup.Evaluacion.service.HospitalizationRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospitalization-requests")
public class HospitalizationRequestController {

    private final HospitalizationRequestService service;

    public HospitalizationRequestController(HospitalizationRequestService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<HospitalizationRequest> create(
            @Valid @RequestBody HospitalizationRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }
}